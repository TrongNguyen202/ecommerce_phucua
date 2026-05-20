from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import register, login, change_password  
from .views import GoogleLoginView
urlpatterns = [
    path("register/",        register),
    path("login/",           login),
    path("token/refresh/",   TokenRefreshView.as_view()),
    path("change-password/", change_password),  # ← thêm dòng này
    path("google/", GoogleLoginView.as_view()),
]