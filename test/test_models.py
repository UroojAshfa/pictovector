import unittest
from dotenv import load_dotenv
from pprint import pprint
from src.qdb import Image, Qdb
from src.llm import LLM
from src.app import _wrap_image
import requests
from datasets import load_dataset

from src.clients import get_qdb_client, get_genai_client

load_dotenv()
dataset = load_dataset("huggingface/cats-image")
image = dataset["test"]["image"][0]

class MyTestCase(unittest.TestCase):
    model = LLM(get_genai_client())
    db = Qdb(get_qdb_client())
    urls = [
        "https://images.pexels.com/photos/310435/pexels-photo-310435.jpeg",
        "https://images.pexels.com/photos/2406250/pexels-photo-2406250.jpeg"
    ]
    images = _wrap_image(urls)
    query_image = _wrap_image(["https://images.pexels.com/photos/949194/pexels-photo-949194.jpeg"])

    def test_sample(self):
        print(requests.get(self.urls[0]))

    def test_img_embed(self):
        image = self.model.img_embed(self.images)
        print(image)

    def test_upload(self):
        response = self.model.image_to_caption(self.images)
        pprint(response)

    def test_embed(self):
        print(self.model.txt_embed(['This image features a clean, minimalist gallery wall '
                 'displaying ten framed black and white photographs. The '
                 'photos are arranged in two rows of five, evenly spaced on a '
                 'plain white wall. Each photograph appears to depict interior '
                 'spaces, possibly offices or public buildings, with a focus '
                 'on architectural lines and empty rooms. The black frames '
                 'provide a sharp contrast against the white background, '
                 'enhancing the presentation of the monochrome artwork.']))

    def test_points(self):
        self.db._create_points(self.model, self.images)
        print(f"payload: {self.db.payloads}"
              f"idx: {self.db.idx}")

    def test_collection(self):
        self.db.create_collection()
        self.db.upload(self.model, self.images)

    def test_query(self):
        uuid = self.db.query_by_image(self.model, self.query_image)
        print(uuid)

    def test_delete(self):
        uuid = "dfc4fedf-3f30-4574-8d14-deef50f17051"
        self.db.delete_points([uuid])






if __name__ == '__main__':
    unittest.main()
