from dotenv import load_dotenv
import requests
from qdrant_client import QdrantClient
from google.genai import Client
from flask import request, Blueprint, g
import vercel_blob
from uuid import uuid4

from torch.distributed.elastic.multiprocessing.redirects import redirect

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

load_env()
bp = Blueprint('main', __name__)

@bp.route('/upload', methods='POST')
def upload():
    file = request.files['file']
    response = request.get_json()
    id = uuid4().__str__()
    vercel_blob.put(id, file.read())
    return "Uploaded"

if __name__ == '__main__':
    load_env()


