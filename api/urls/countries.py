from django.urls import path
from api.views.countries_info import CountryInfoViewSet


urlpatterns = [
    path("v1/countries/", CountryInfoViewSet.as_view({"get": "list", "post": "create"}), name="country-list"),
    path("v1/countries/<int:country_id>/", CountryInfoViewSet.as_view({"get": "retrieve", "patch": "partial_update", "delete": "destroy"}), name="country-detail"),
]