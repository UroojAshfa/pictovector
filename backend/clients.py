import os

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


def get_qdb_client(host: str | None = None, api: str | None = None) -> QdrantClient:
    """
    Qdrant database client generator
    :param host: str | None
    :param api: str | None
    :return: QdrantClient
    """
    global _qdb_client

    if host is None:
        host = QDRANT_ENDPOINT
    if api is None:
        api = os.getenv("QDRANT_API_KEY")

    if _qdb_client is None:
        try:
            _qdb_client = QdrantClient(url=host, api_key=api)
        except Exception as msg:
            print(f"Qdrant Client Error: {msg}")

    return _qdb_client
