import asyncio
import json
import logging

from typing import Any, Dict, Set, Callable, Awaitable, Optional, TYPE_CHECKING

from websockets.server import serve, WebSocketServerProtocol as WSSP
from websockets.client import connect, WebSocketClientProtocol as WSCP
from websockets.exceptions import ConnectionClosed, WebSocketException

# Configure logging
logging.basicConfig(
  level=logging.INFO,
  format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)