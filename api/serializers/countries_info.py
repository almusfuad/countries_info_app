from rest_framework import serializers
from api.models.countries_info import CountryInfo
from django.core.exceptions import ValidationError
import re


class CountryInfoSerializer(serializers.ModelSerializer):
    """Serializer for the CountryInfo model.
    
    This serializer is used to convert the CountryInfo model instances into JSON format
    and validate incoming data for creating or updating CountryInfo instances.
    """
    
    
    def validate_name(self, value):
        """Validate the country name."""
        if not value:
            raise serializers.ValidationError("Country name cannot be empty.")
        if len(value.strip()) < 2:
            raise serializers.ValidationError("Country name must be at least 2 characters long.")
        if not re.match(r'^[a-zA-Z\s]+$', value):
            raise serializers.ValidationError("Country name can only contain letters and spaces.")
        return value.strip()
    
    
    def validate_capital(self, value):
        """Validate the capital name."""
        if value and not re.match(r'^[a-zA-Z\s]+$', value):
            raise serializers.ValidationError("Capital name can only contain letters and spaces.")
        return value.strip() if value else ""
    
    
    def validate_region(self, value):
        """Validate the region name."""
        if value and not re.match(r'^[a-zA-Z\s]+$', value):
            raise serializers.ValidationError("Region name can only contain letters and spaces.")
        return value.strip() if value else ""
    
    
    def validate_subregion(self, value):
        """Validate the subregion name."""
        if value and not re.match(r'^[a-zA-Z\s]+$', value):
            raise serializers.ValidationError("Subregion name can only contain letters and spaces.")
        return value.strip() if value else ""
    
    
    def validate_population(self, value):
        """Validate the population."""
        if value < 0:
            raise serializers.ValidationError("Population cannot be negative.")
        if value > 10**10:
            raise serializers.ValidationError("Population exceeds realistic limits.")
        return value
    
    
    def validate_area(self, value):
        """Validate the area."""
        if value < 0:
            raise serializers.ValidationError("Area cannot be negative.")
        if value > 10**8:
            raise serializers.ValidationError("Area exceeds realistic limits.")
        return value
    
    
    def validat_languages(self, value):
        """Validate the languages."""
        if not isinstance(value, list):
            raise serializers.ValidationError("Languages must be a list.")
        if not all(isinstance(lang, str) and lang.strip() for lang in value):
            raise serializers.ValidationError("Each language must be a non-empty string.")
        if len(value) > 100:
            raise serializers.ValidationError("Too many languages specified.")
        return [lang.strip() for lang in value]
    
    
    def validate_currencies(self, value):
        """Validate the currencies."""
        if not isinstance(value, list):
            raise serializers.ValidationError("Currencies must be a list.")
        if not all(isinstance(curr, str) and curr.strip() for curr in value):
            raise serializers.ValidationError("Each currency must be a non-empty string.")
        if len(value) > 50:
            raise serializers.ValidationError("Too many currencies specified.")
        return [curr.strip() for curr in value]
    
    
    def validate_timezones(self, value):
        """Validate the timezones."""
        if not isinstance(value, list):
            raise serializers.ValidationError("Timezones must be a list.")
        if not all(isinstance(tz, str) and tz.strip() for tz in value):
            raise serializers.ValidationError("Each timezone must be a non-empty string.")
        if len(value) > 50:
            raise serializers.ValidationError("Too many timezones specified.")
        return [tz.strip() for tz in value]
    
    
    def validate_flag(self, value):
        """Validate the flag URL."""
        if value and not re.match(r'^https?://[^\s<>"]+|www\.[^\s<>"]+$', value):
            raise serializers.ValidationError("Invalid URL format for flag.")
        return value.strip() if value else ""
    
    
    def validate(self, data):
        """Object-level validation."""
        # Ensure that at least one of languages, currencies, or timezones is provided
        if not (data.get('languages') or data.get('currencies') or data.get('timezones')):
            raise serializers.ValidationError("At least one of languages, currencies, or timezones must be provided.")
        
        if data.get('population', 0) > 10**6 and not data.get('capital'):
            raise serializers.ValidationError({
                "capital": "Capital is required for countries with a population over 1 million."
            })        
        return data
        
    
    class Meta:
        model = CountryInfo
        fields = '__all__'
        read_only_fields = ('id','created_at', 'updated_at')
        