from dotenv import load_dotenv
import requests
from qdrant_client import QdrantClient
from google.genai import Client

from . import clients
from .qdb import Image

genai_client: Client | None = None
qdb_client: QdrantClient | None = None

#Load environment and client
def load_env():
    load_dotenv()
    global genai_client
    global qdb_client
    genai_client = clients.get_genai_client()
    qdb_client = clients.get_qdb_client()

def _wrap_image(urls: list[str]):
    images = [Image(requests.get(url).content, url) for url in urls]
    return images


if __name__ == "__main__":
    load_env()


