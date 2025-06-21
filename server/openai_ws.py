from common_imports import *
import os
import base64

# --- Configuration ---
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY") or None
if not OPENAI_API_KEY:
  raise ValueError("Failed to get OpenAI API key")

OPENAI_CONFIG = {
  "api_key": OPENAI_API_KEY,
  "model": "gpt-4o-realtime-preview-2024-10-01",
  "endpoint": "wss://api.openai.com/v1/realtime",
  "modalities": ["audio", "text"],
  "input_audio_format": "pcm16",
  "transcription_model": None,
  "initial_prompt": None,             # or a string to send before audio
}

OPENAI_HDRS = {
  "Authorization": f"Bearer {os.getenv('OPENAI_API_KEY')}",
  "OpenAI-Beta": "realtime=v1"
}

OPENAI_WS_URI = f"{OPENAI_CONFIG['endpoint']}?model={OPENAI_CONFIG['model']}"

if TYPE_CHECKING:
  from .sesh_handler import ClientSession

class OpenAIStreamingClient:
  def __init__(self, session: ClientSession) -> None:
    self.session: ClientSession = session
    self.ws: Optional[WSCP] = None

  async def run(self) -> None:
    try:
      async with connect(OPENAI_WS_URI, extra_headers=OPENAI_HDRS) as ws:
        self.ws = ws
        await self.ws.send(json.dumps(OPENAI_CONFIG))
        send_task = asyncio.create_task(self.send_audio()) 
        recv_task = asyncio.create_task(self.receive_text())
        await asyncio.gather(send_task, recv_task)
    except Exception as e:
      logger.error(f"[OpenAI] Error constructing OpenAI stream: {e}")

  async def send_audio(self) -> None:
    while True:
      chunk = await self.session.openai_queue.get()
      payload = {
        "type": "input_audio_buffer.append",
        "audio": base64.b64encode(chunk).decode("utf-8")
      }
      if self.ws: await self.ws.send(json.dumps(payload))

  async def receive_text(self) -> None:
    if self.ws is None: return

    text = str()
    async for msg in self.ws:
      try:
        data = json.loads(msg)
        if data.get("type") != "response.text.delta": continue
        delta = data.get("delta", "")
        if delta: text += delta
      except Exception as e:
        logger.warning(f"[OpenAI] Failed to parse message: {e}")
      finally:
        await self.session.d_id_queue.put(text)