from common_imports import *
import os
import requests
import base64

# --- Configuration ---
DID_API_KEY = os.getenv("DID_API_KEY")
if not DID_API_KEY:
    raise ValueError("Cannot retrieve API Key for d-ID")

DID_CONFIG = {
    "api_key": DID_API_KEY,
    "generate_url": "https://api.d-id.com/talks",
    "get_url": "https://api.d-id.com/talks/{talk_id}",
    "image_url": "https://imaginehack.vercel.app/tun1.png",
    "voice_id": "en-IN-PrabhatNeural",
}

DID_HEADERS = {
    "accept": "application/json",
    "content-type": "application/json",
    "authorization": f"Basic {DID_API_KEY}"
}

if TYPE_CHECKING:
    from .sesh_handler import ClientSession

class DIDStreamingClient:
    def __init__(self, session: ClientSession) -> None:
        self.session: ClientSession = session
        self.talk_id: Optional[str] = None

    async def run(self) -> None:
        try:
            send_task = asyncio.create_task(self.send_text())
            recv_task = asyncio.create_task(self.receive_video())
            await asyncio.gather(send_task, recv_task)
        except Exception as e:
            logger.error(f"[DID] Error in streaming: {e}")

    async def send_text(self) -> None:
        text = await self.session.d_id_queue.get()
        payload = {
            "source_url": DID_CONFIG["image_url"],
            "script": {
                "type": "text",
                "input": text,
                "provider": {
                    "type": "microsoft",
                    "voice_id": DID_CONFIG["voice_id"]
                }
            }
        }
        
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None, lambda: requests.post(DID_CONFIG["generate_url"], 
                                      headers=DID_HEADERS, 
                                      data=json.dumps(payload))
        )
        
        data = response.json()
        self.talk_id = data.get("id")
        logger.info(f"[DID] Talk ID: {self.talk_id}")

    async def receive_video(self) -> None:
        while True:
            if self.talk_id:
                video_url = await self.poll_for_video()
                if video_url:
                    await self.stream_video(video_url)
                    self.talk_id = None
            await asyncio.sleep(1)

    async def poll_for_video(self) -> Optional[str]:
        url = DID_CONFIG["get_url"].format(talk_id=self.talk_id)
        loop = asyncio.get_event_loop()
        
        response = await loop.run_in_executor(
            None, lambda: requests.get(url, headers=DID_HEADERS)
        )
        
        data = response.json()
        if data.get("status") == "done":
            return data.get("result_url")
        return None

    async def stream_video(self, video_url: str) -> None:
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None, lambda: requests.get(video_url, stream=True)
        )
        
        for chunk in response.iter_content(chunk_size=8192):
            if chunk:
                video_data = base64.b64encode(chunk).decode('utf-8')
                await self.session.websocket.send(json.dumps({
                    "type": "video_chunk",
                    "data": video_data
                }))