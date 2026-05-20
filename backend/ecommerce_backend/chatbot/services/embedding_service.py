from openai import OpenAI
from decouple import config

client = OpenAI(
    api_key=config("OPENAI_API_KEY")
)


def create_embedding(text):

    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=text
    )

    return response.data[0].embedding