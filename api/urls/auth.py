from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from api.views.auth import LoginView, LogoutView


urlpatterns = [
    path("v1/login/", LoginView.as_view(), name="login"),
    path("v1/logout/", LogoutView.as_view(), name="logout"),
    path("v1/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]