from common_imports import *
import media_ws

def main() -> None:
  try:
    asyncio.run(media_ws.start_server())
  except KeyboardInterrupt:
    logger.info("Server stopped by user")
  except Exception as e:
    logger.error(f"Fatal error: {e}")
    exit(1)

if __name__ == "__main__":
  main()