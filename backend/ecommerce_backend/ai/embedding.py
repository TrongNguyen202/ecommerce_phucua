from sentence_transformers import SentenceTransformer

model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)

def create_product_embedding(product):

    text = f"""
    Product: {product.name}

    Description:
    {product.description}

    Category:
    {product.category.name}
    """

    embedding = model.encode(text)

    return embedding.tolist()