from common_imports import *
from openai_ws import OpenAIStreamingClient
from deepfake import DIDStreamingClient

class ClientSession:
  def __init__(self, websocket: WSSP):
    self.websocket: WSSP = websocket
    self.user_id: str = f"{websocket.remote_address[0]}:{websocket.remote_address[1]}"

    self.openai_queue: asyncio.Queue[bytes] = asyncio.Queue() # Frontend to OpenAI
    self.openai_task: Optional[asyncio.Task] = None
    self.openai_class = OpenAIStreamingClient(self)

    self.d_id_queue: asyncio.Queue[str] = asyncio.Queue() # OpenAI to D-ID
    self.d_id_task: Optional[asyncio.Task] = None
    self.d_id_class = DIDStreamingClient(self)
  
  async def start(self):
    self.openai_task = asyncio.create_task(self.openai_class.run())
    self.d_id_task = asyncio.create_task(self.d_id_class.run())

  async def handle_audio(self, data: bytes):
    await self.openai_queue.put(data)

  async def handle_video(self, data: bytes):
    # e.g., decode frame, run face recognition
    pass

  async def shutdown(self):
    if self.openai_task:
      self.openai_task.cancel()
    if self.d_id_task:
      self.d_id_task.cancel()