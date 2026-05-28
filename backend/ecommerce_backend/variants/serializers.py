from rest_framework import serializers
from .models import Size, Color, ProductType, ProductVariant
from .models import Product

class SizeSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Size
        fields = ["id", "name", "order"]


class ColorSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Color
        fields = ["id", "name", "hex_code"]


class ProductTypeSerializer(serializers.ModelSerializer):  # ← thêm
    class Meta:
        model  = ProductType
        fields = ["id", "name"]


class ProductVariantSerializer(serializers.ModelSerializer):
    product = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all()
    )
    image   = serializers.URLField(required=False, allow_blank=True)
    size    = SizeSerializer(read_only=True)
    color   = ColorSerializer(read_only=True)
    type    = ProductTypeSerializer(read_only=True)   # ← thêm

    size_id = serializers.PrimaryKeyRelatedField(
        queryset=Size.objects.all(), source="size", write_only=True, required=False
    )
    color_id = serializers.PrimaryKeyRelatedField(
        queryset=Color.objects.all(), source="color", write_only=True, required=False
    )
    type_id = serializers.PrimaryKeyRelatedField(     # ← thêm
        queryset=ProductType.objects.all(), source="type", write_only=True, required=False
    )

    price    = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    in_stock = serializers.BooleanField(read_only=True)
    product_thumbnail = serializers.SerializerMethodField()  # ← thêm

    def get_product_thumbnail(self, obj):
        # lấy thumbnail từ product
        product = obj.product
        if hasattr(product, 'thumbnail') and product.thumbnail:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(product.thumbnail.url)
            return product.thumbnail.url
        # fallback: lấy ảnh đầu tiên trong product.images nếu có
        if hasattr(product, 'images'):
            first = product.images.first()
            if first and hasattr(first, 'url'):
                return first.url
            if first and hasattr(first, 'image'):
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(first.image.url)
                return first.image.url
        return ""

    class Meta:
        model  = ProductVariant
        fields = [
            "id",
            "product",
            "sku",
            "size", "size_id",
            "color", "color_id",
            "type", "type_id",
            "price", "price_override",
            "stock", "in_stock",
            "image",
            "product_thumbnail",  # ← thêm
            "is_active",
        ]
        read_only_fields = ["id"]