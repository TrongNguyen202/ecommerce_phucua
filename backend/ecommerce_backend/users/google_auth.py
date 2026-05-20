from google.oauth2 import id_token
from google.auth.transport import requests
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken

import os
from dotenv import load_dotenv

load_dotenv()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")


def google_authenticate(token):
    idinfo = id_token.verify_oauth2_token(
        token,
        requests.Request(),
        GOOGLE_CLIENT_ID
    )

    email = idinfo.get("email")
    name = idinfo.get("name")

    if not email:
        raise ValueError("Google account has no email")

    username = email.split("@")[0]

    user, created = User.objects.get_or_create(
        email=email,
        defaults={
            "username": username,
            "first_name": name,
        }
    )

    refresh = RefreshToken.for_user(user)

    return {
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
        },
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }