import time
from qdrant_client.http.models import VectorParams, Distance, PointIdsList, MatchAny, Filter, FieldCondition
from qdrant_client.qdrant_client import QdrantClient
import uuid

from .llm import LLM
from config import IMAGE_EMBEDDING_SIZE, TEXT_EMBEDDING_SIZE, COLLECTION

BASE_DELAY = 5

class Image:
    """
    Class for images
    """
    image_bytes: bytes
    url: str

    def __init__(self, image_bytes: bytes, url: str):
        self.image_bytes = image_bytes
        self.url = url

class Qdb:
    """
    Class for points in column-oriented format
    """
    vectors: list[dict] | None = None
    idx: list[str] | None = None
    payloads: list[dict] | None = None
    db_client: QdrantClient

    def __init__(self, db_client: QdrantClient):
        self.db_client = db_client

    def _create_points(self, model: LLM, images: list[Image]):
        """
        Creates vectors, indices and payloads for images
        :param model: LLM
        :param images: list[Image]
        :return: None
        """
        time.sleep(BASE_DELAY)
        # ToDo: Add exponential backoff and model switch
        responses = model.image_to_caption(images=images)

        tags = [response["tags"] for response in responses]
        descriptions = [response["description"] for response in responses]

        image_embeddings = model.img_embed(images)
        text_embeddings = model.txt_embed(descriptions)

        self.vectors = [{"image": image, "description": desc.values} for image, desc in
                        zip(image_embeddings, text_embeddings)]
        self.idx = [uuid.uuid4().__str__() for _ in images]
        self.payloads = [{
            "uuid": uid,
            "tags": tag,
            "url": image.url,
        } for uid, tag, image in zip(self.idx, tags, images)]

    def create_collection(self):
        """
        Initialises 'Images' collection
        :return: None
        """
        if self.db_client.collection_exists(collection_name=COLLECTION) is False:
            try:
                self.db_client.create_collection(
                    collection_name=COLLECTION,
                    vectors_config={
                        "image":VectorParams(size=IMAGE_EMBEDDING_SIZE, distance=Distance.DOT),
                        "description":VectorParams(size=TEXT_EMBEDDING_SIZE, distance=Distance.DOT),
                    }
                )
            except Exception as msg:
                print(f"Collection creation error:\n{msg}")

    def upload(self, model: LLM, images: list[Image]):
        """
        Uploads sequence of images as vectors with its payload to the collection
        :param model: LLM
        :param images: list[Image]
        :return: None
        """
        if not self.db_client.collection_exists(collection_name=COLLECTION):
            print("INFO: Creating collection.")
            self.create_collection()
            print(f"INFO: Collection {COLLECTION} created.")

        self._create_points(model, images)

        try:
            self.db_client.upload_collection(
                collection_name=COLLECTION,
                ids=self.idx,
                vectors=self.vectors,
                payload=self.payloads,
                parallel=2,
                wait=True
            )
        except Exception as msg:
            print(f"Upload Error:\n{msg}")

    @staticmethod
    def _parse_filter(filters: list[str] | None = None) -> None | Filter:
        """
        Wrapper function for filters
        :param filters: list[str]
        :return: None | Filter
        """
        must_list = []
        if filters:
            must_list.append(
               FieldCondition(
                   key="tags",
                   match=MatchAny(any=filters)
               ),
            )
        if must_list:
            return Filter(must=must_list)

        return None

    def query_by_image(
        self,
        model: LLM,
        images: list[Image],
        filters: list[str] | None = None,
        limit: int = 5,
    ) -> list[tuple]:
        """
        Search similar images by dot product
        :param model: LLM
        :param images: list[Image]
        :param filters: None | list[str]
        :param limit: int
        :return: list[tuple]
        """

        vector = model.img_embed(images)
        try:
            response = self.db_client.query_points(
                collection_name=COLLECTION,
                query=vector[0],
                using="image",
                query_filter=self._parse_filter(filters),
                limit = limit,
            )
            uuids = [(point.id, point.score) for point in response.points]
            return uuids

        except Exception as msg:
            print(msg)

    def delete_points(self, uuids: list[str]):
        """
        Delete points by uuids
        :param uuids: list[str]
        :return: None
        """
        try:
            update_result = self.db_client.delete(
                collection_name=COLLECTION,
                points_selector=PointIdsList(
                    points=uuids
                ),
                wait=True,
            )

        except Exception as msg:
            print(f"Delete Error:\n{msg}")

    def delete_collection(self):
        pass







