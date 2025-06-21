from common_imports import *
from datetime import datetime
from sesh_handler import ClientSession

class MediaStreamingServer:
  def __init__(self):
    self.sessions: Dict[WSSP, ClientSession] = {}

  def get_client_addr(self, websocket: WSSP) -> str:
    return f"{websocket.remote_address[0]}:{websocket.remote_address[1]}"

  async def register_client(self, websocket: WSSP) -> None:
    self.sessions[websocket] = ClientSession(websocket)
    logger.info(f"Client connected: {self.sessions[websocket].user_id} "
                f"(Total: {len(self.sessions)})")
  
  async def unregister_client(self, websocket: WSSP) -> None:
    del self.sessions[websocket]

    try:
      logger.info(f"Client disconnected: {self.sessions[websocket].user_id} "
                  f"(Total: {len(self.sessions)})")
    except:
      logger.info(f"Client disconnected (Total: {len(self.sessions)})")

  async def handle_client_msg(self, websocket: WSSP, message: str) -> None:
    try:
      data = json.loads(message)
      message_type = str(data.get("type", "unknown"))

      response: Dict[str, Any] = {
        "type": f"{message_type}_ack",
        "timestamp": datetime.now().isoformat(),
        "status": "success"
      }

      match message_type:
        case "client_connected":
          response.update({
            "message": "Welcome to media streaming server",
            "server_version": "1.0.0",
            "supported_formats": ["jpg", "wav"]
          })

        case "start_audio_stream":
          response.update({
            "message": "Audio stream recording started",
            "format": data.get("format", "wav")
          })
        
        case "start_video_stream":
          response.update({
            "message": "Video stream recording started",
            "format": data.get("format", "jpg")
          })

        case "stop_audio_stream":
          response.update({
            "message": "Audio stream recording stopped"
          })

        case "stop_video_stream":
          response.update({
            "message": "Video stream recording stopped"
          })
      
      await websocket.send(json.dumps(response))
      logger.debug(f"Handled {message_type} message for {self.sessions[websocket].user_id}")

    except json.JSONDecodeError:
      logger.warning(f"Received invalid JSON: {message[:100]}...")
    except Exception as e:
      logger.error(f"Error handling message: {e}")

  async def handle_client_connection(self, websocket: WSSP) -> None:
    await self.register_client(websocket)
    bytes_received = int(0)

    try:
      async for message in websocket:
        if isinstance(message, bytes):
          match(message[:5]):
            case b"audio": await self.sessions[websocket].handle_audio(message[5:])
            case b"frame": await self.sessions[websocket].handle_video(message[5:])
          bytes_received += len(message)

        elif isinstance(message, str):
          await self.handle_client_msg(websocket, message)

    except ConnectionClosed:
      logger.info(f"Client connection {self.sessions[websocket].user_id} closed normally")
    except WebSocketException as e:
      logger.warning(f"WebSocket error: {e}")
    except Exception as e:
      logger.error(f"Unexpected error handling client: {e}")
    
    finally:
      await self.unregister_client(websocket)

async def start_server(host: str = "0.0.0.0", port: int = 8080):
  server = MediaStreamingServer()
  logger.info(f"Starting media streaming server on {host}:{port}")

  try:
    async with serve(
      ws_handler=server.handle_client_connection,
      host=host, port=port
    ):
      logger.info("Video server successfully started")
      logger.info("Press Ctrl+C to stop")
      await asyncio.Future() # Keep server running

  except Exception as e:
    logger.error(f"Server error: {e}")
    raise