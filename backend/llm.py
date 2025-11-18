from google.genai import Client, types
import json
import io
from PIL import Image as PILImage
from transformers import ResNetModel, AutoImageProcessor
from typing import TYPE_CHECKING
from google.genai.types import ContentEmbedding
import torch
from config import *

if TYPE_CHECKING:
    from .qdb import Image

response_schema = {
    "type": "ARRAY",
    "items": {
        "type": "OBJECT",
        "properties": {
            "description": {"type": "STRING"},
            "tags": {"type": "ARRAY",
                     "items": {"type": "STRING"}
                     }
        },
        "required": ["description", "tags"],
    },
}

image_to_caption_prompt = """
    Give a brief description and tags for the each image.
"""

system_instruction = """
    The description should be 3 to 4 sentences and align with the image.
    Tags should represent the image the most and be precise.
    Do not be creative.
    Provide top 10 tags.
"""


class LLM:
    """
    Embeddings, description and tag generation
    """
    client = None

    def __init__(self, client: Client):
        if not self.client:
            self.client = client

    @staticmethod
    def img_embed(images: list['Image']) -> list[list[float]]:
        """
        Image Embedding from RESNET-50
        :param images: list[Image]
        :return: list[list[float]]
        """
        image_processor = AutoImageProcessor.from_pretrained(IMAGE_EMBEDDING_MODEL, use_fast=True)
        model = ResNetModel.from_pretrained(IMAGE_EMBEDDING_MODEL)

        images_list = [PILImage.open(io.BytesIO(image.image_bytes)) for image in images]
        inputs = image_processor(images_list, return_tensors="pt")

        with torch.no_grad():
            output = model(**inputs)

        flattened_embed = torch.flatten(output.pooler_output, start_dim=1)

        return flattened_embed.tolist()

    def txt_embed(self, descriptions: list[str]) -> list[ContentEmbedding]:
        """
        Text Embedding from Gemini embedding model
        :param descriptions: list[str]
        :return: list[ContentEmbedding]
        """
        result = self.client.models.embed_content(
            model=TEXT_EMBEDDING_MODEL,
            contents=descriptions,
            config={
                "task_type": EMBEDDING_TASK,
                "output_dimensionality": TEXT_EMBEDDING_SIZE,
            }
        )
        return result.embeddings

    def image_to_caption(self, images: list['Image']) -> list[dict]:
        """
        Description and tags generation for the images from Gemini chat models
        :param images: list[Image]
        :return: response_schema -> list[dict]
        """
        content = [image_to_caption_prompt] + \
                  [types.Part.from_bytes(data=image.image_bytes, mime_type="image/jpeg") for image in images]
        # ToDo: Compress Images and standardise before sending in

        responses = self.client.models.generate_content(
            model=CHAT_MODEL,
            contents=content,
            config={
                "response_mime_type": "application/json",
                "response_schema": response_schema,
                "system_instruction": system_instruction,
            },
        )
        responses = json.loads(responses.text)
        return responses
