from openai import OpenAI

from pgvector.django import CosineDistance

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from products.models import Product

from chatbot.models import (
    AIConversation,
    UserAIMemory
)

from chatbot.services.embedding_service import (
    create_embedding
)

client = OpenAI()


class AIChatView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        user = request.user

        message = request.data.get("message")

        # ─────────────────────────────────────
        # SAVE USER MESSAGE
        # ─────────────────────────────────────

        AIConversation.objects.create(
            user=user,
            role="user",
            content=message
        )

        # ─────────────────────────────────────
        # GET OR CREATE MEMORY
        # ─────────────────────────────────────

        memory, _ = UserAIMemory.objects.get_or_create(
            user=user
        )

        # ─────────────────────────────────────
        # VECTOR SEARCH
        # ─────────────────────────────────────

        query_embedding = create_embedding(message)

        products = Product.objects.annotate(
            distance=CosineDistance(
                "embedding",
                query_embedding
            )
        ).order_by("distance")[:5]

        # ─────────────────────────────────────
        # PRODUCT CONTEXT
        # ─────────────────────────────────────

        context = "\n".join([
            f"""
            Product: {p.name}
            Description: {p.description}
            Price: {p.base_price}
            """
            for p in products
        ])

        # ─────────────────────────────────────
        # CHAT HISTORY
        # ─────────────────────────────────────

        history = AIConversation.objects.filter(
            user=user
        ).order_by("-created_at")[:10]

        history_text = "\n".join([
            f"{h.role}: {h.content}"
            for h in reversed(history)
        ])

        # ─────────────────────────────────────
        # MEMORY PROMPT
        # ─────────────────────────────────────

        memory_text = f"""
        Favorite style:
        {memory.favorite_style}

        Favorite colors:
        {memory.favorite_colors}

        Favorite categories:
        {memory.favorite_categories}

        Budget:
        {memory.budget_min} - {memory.budget_max}

        Sizes:
        {memory.sizes}
        """

        # ─────────────────────────────────────
        # FINAL PROMPT
        # ─────────────────────────────────────

        prompt = f"""
        Bạn là AI stylist cho shop thời trang.

        ====================
        USER MEMORY
        ====================

        {memory_text}

        ====================
        CHAT HISTORY
        ====================

        {history_text}

        ====================
        PRODUCTS
        ====================

        {context}

        ====================
        USER QUESTION
        ====================

        {message}
        """

        # ─────────────────────────────────────
        # OPENAI
        # ─────────────────────────────────────

        response = client.chat.completions.create(
            model="gpt-4.1-mini",

            messages=[
                {
                    "role": "system",
                    "content": """
                    Bạn là stylist AI.

                    Bạn phải:
                    - recommend sản phẩm phù hợp
                    - hiểu style user
                    - nhớ sở thích user
                    - nói chuyện tự nhiên
                    """
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        ai_message = response.choices[0].message.content

        # ─────────────────────────────────────
        # SAVE AI RESPONSE
        # ─────────────────────────────────────

        AIConversation.objects.create(
            user=user,
            role="assistant",
            content=ai_message
        )

        # ─────────────────────────────────────
        # SIMPLE MEMORY UPDATE
        # ─────────────────────────────────────

        lower_message = message.lower()

        if "đen" in lower_message:
            if "black" not in memory.favorite_colors:
                memory.favorite_colors.append("black")

        if "oversize" in lower_message:
            memory.favorite_style = "oversize"

        if "hoodie" in lower_message:
            if "hoodie" not in memory.favorite_categories:
                memory.favorite_categories.append("hoodie")

        memory.save()

        # ─────────────────────────────────────
        # RESPONSE
        # ─────────────────────────────────────

        return Response({

            "message": ai_message,

            "products": [
                {
                    "id": p.id,
                    "name": p.name,
                    "thumbnail": p.thumbnail,
                    "price": p.base_price,
                    "slug": p.slug
                }
                for p in products
            ]
        })