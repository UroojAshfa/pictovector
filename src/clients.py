from config import *
from google import genai
from google.genai import Client, errors
from qdrant_client.qdrant_client import QdrantClient

_genai_client: Client | None = None
_qdb_client: QdrantClient | None = None

def get_genai_client(api: str | None = None) -> Client:
    """
    Google client generator
    :param api: str | None
    :return: Client
    """
    global _genai_client

    if _genai_client is None:
        try:
            _genai_client = genai.Client(api_key=api)
        except errors.ClientError as msg:
            print(f"Client Error: {msg}")
        except errors.APIError as msg:
            print(f"API Error: {msg}")

    return _genai_client

def get_qdb_client(localhost: str | None = None) -> QdrantClient:
    """
    Qdrant database client generator
    :param localhost: str | None
    :return: QdrantClient
    """
    global _qdb_client

    if localhost is None:
        localhost = LOCALHOST

    if _qdb_client is None:
        try:
            _qdb_client = QdrantClient(localhost)
        except Exception as msg:
            print(f"Qdrant Client Error: {msg}")

    return _qdb_client