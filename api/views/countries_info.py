from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ValidationError, NotFound
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.pagination import PageNumberPagination
from rest_framework.decorators import action
from django.db.models import Q
from api.models.countries_info import CountryInfo
from api.serializers.countries_info import CountryInfoSerializer


class CountryInfoPagination(PageNumberPagination):
    """Custom pagination class for CountryInfoViewSet.
    
    This class customizes the pagination settings for the CountryInfoViewSet.
    """
    
    page_size = 25
    page_size_query_param = "page_size"
    max_page_size = 100
    page_query_param = "page"
    last_page_strings = ("last",)
    invalid_page_message = "Invalid page number."




class CountryInfoViewSet(ModelViewSet):
    """ViewSet for the CountryInfo model.
    
    This viewset provides CRUD operations for the CountryInfo model.
    It uses the CountryInfoSerializer to serialize and deserialize data.
    """
    
    queryset = CountryInfo.objects.all()
    serializer_class = CountryInfoSerializer
    lookup_field = "id"
    lookup_url_kwarg = "country_id"
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    pagination_class = CountryInfoPagination
    
            
    
    def get_queryset(self):
        """Customize queryset based on query parameters.
        
        Supports filtering by:
        - region: List countries in the same region as a specific country.
        - subregion: List countries in the same subregion as a specific country.
        - language: List countries that speak a specific language.
        - name: Partial search by country name.
        - include_deleted: Include deleted countries in the results.
        
        Returns only active records (is_active=True) by default.
        """
        queryset = super().get_queryset().order_by("name")
        
        
        # Filter active records by default
        include_deleted = self.request.query_params.get("include_deleted", "false").lower() == "true"
        if not include_deleted:
            queryset = queryset.filter(is_active=True)
        
        
        # Filter by region (same region as a specific country)
        region_country_id = self.request.query_params.get("region_country_id")
        if region_country_id:
            try:
                country = CountryInfo.objects.get(id=region_country_id)
                if country.region:
                    queryset = queryset.filter(region=country.region)
                else:
                    queryset = queryset.none()
            except CountryInfo.DoesNotExist:
                raise NotFound(f"Country with ID {region_country_id} does not exist.")
            
            
        # Filter by subregion (same subregion as a specific country)
        subregion_country_id = self.request.query_params.get("subregion_country_id")
        if subregion_country_id:
            try:
                country = CountryInfo.objects.get(id=subregion_country_id)
                if country.subregion:
                    queryset = queryset.filter(subregion=country.subregion)
                else:
                    queryset = queryset.none()
            except CountryInfo.DoesNotExist:
                raise NotFound(f"Country with ID {subregion_country_id} does not exist.")
            
            
        # Filter by language
        language = self.request.query_params.get("language")
        if language:
            if not language.strip():
                raise ValidationError("Language cannot be empty.")
            queryset = queryset.filter(
                Q(languages__icontains=[language.lower()]) | 
                Q(languages__icontains=[language.lower()])
            )
            
            
        # Filter by name (partial search)
        name = self.request.query_params.get("name")
        if name:
            if not name.strip():
                raise ValidationError("Name cannot be empty.")
            queryset = queryset.filter(name__icontains=name.strip())
            
            
        return queryset
    
    
    def destroy(self, request, *args, **kwargs):
        """Soft delete a country by settings is_active=False.
        
        Instead of permanently deleting the record, this method sets the is_active field to False.
        """
        instance = self.get_object()
        instance.is_active = False
        instance.save()
        return Response(
            {"detail": f"Country {instance.name} has been deleted."},
            status=status.HTTP_204_NO_CONTENT,
        )
        
        
    
    def restore(self, request, country_id=None):
        """Restore a soft-deleted country by setting is_active=True.
        
        Args:
            request: The HTTP request object.
            country_id: The ID of the country to restore.
                    
        Returns:
            Response: A response indicating the result of the restore operation.
        """
        instance = self.get_object()
        if instance.is_active:
            raise ValidationError(f"Country '{instance.name}' is already active.")
        instance.is_active = True
        instance.save()
        serializer = self.get_serializer(instance)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    
    
    