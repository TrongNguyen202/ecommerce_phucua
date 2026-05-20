from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Product

from chatbot.services.embedding_service import (
    create_embedding
)


@receiver(post_save, sender=Product)
def generate_product_embedding(
    sender,
    instance,
    created,
    **kwargs
):

    text = f"""
    {instance.name}

    {instance.description}
    """

    embedding = create_embedding(text)

    Product.objects.filter(
        id=instance.id
    ).update(
        embedding=embedding
    )