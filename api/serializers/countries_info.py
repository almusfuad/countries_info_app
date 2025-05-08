from rest_framework import serializers
from api.models.countries_info import CountryInfo
import re

class CountryInfoSerializer(serializers.ModelSerializer):
    """Serializer for the CountryInfo model.
    
    Converts CountryInfo model instances to/from JSON and validates data for
    creating or updating instances. Ensures data aligns with API-sourced country
    information and model constraints.
    """
    
    def validate_name(self, value):
        """Validate the country name."""
        if not value:
            raise serializers.ValidationError("Country name cannot be empty.")
        if len(value.strip()) < 2:
            raise serializers.ValidationError("Country name must be at least 2 characters long.")
        # Allow letters, spaces, apostrophes, hyphens, and basic punctuation
        if not re.match(r'^[a-zA-Z\s\'\-\,\.]+$', value):
            raise serializers.ValidationError("Country name can only contain letters, spaces, apostrophes, hyphens, commas, or periods.")
        return value
    
    def validate_capital(self, value):
        """Validate the capital name."""
        if value and not re.match(r'^[a-zA-Z\s\'\-\,\.]+$', value):
            raise serializers.ValidationError("Capital name can only contain letters, spaces, apostrophes, hyphens, commas, or periods.")
        return value or ""
    
    def validate_region(self, value):
        """Validate the region name."""
        if value and not re.match(r'^[a-zA-Z\s\'\-\,\.]+$', value):
            raise serializers.ValidationError("Region name can only contain letters, spaces, apostrophes, hyphens, commas, or periods.")
        return value or ""
    
    def validate_subregion(self, value):
        """Validate the subregion name."""
        if value and not re.match(r'^[a-zA-Z\s\'\-\,\.]+$', value):
            raise serializers.ValidationError("Subregion name can only contain letters, spaces, apostrophes, hyphens, commas, or periods.")
        return value or ""
    
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
    
    def validate_languages(self, value):
        """Validate the languages."""
        if not isinstance(value, list):
            raise serializers.ValidationError("Languages must be a list.")
        if not all(isinstance(lang, str) and lang.strip() for lang in value):
            raise serializers.ValidationError("Each language must be a non-empty string.")
        if len(value) > 100:
            raise serializers.ValidationError("Too many languages specified.")
        return value
    
    def validate_currencies(self, value):
        """Validate the currencies."""
        if not isinstance(value, list):
            raise serializers.ValidationError("Currencies must be a list.")
        if not all(isinstance(curr, str) and curr.strip() for curr in value):
            raise serializers.ValidationError("Each currency must be a non-empty string.")
        if len(value) > 50:
            raise serializers.ValidationError("Too many currencies specified.")
        return value
    
    def validate_timezones(self, value):
        """Validate the timezones."""
        if not isinstance(value, list):
            raise serializers.ValidationError("Timezones must be a list.")
        if not all(isinstance(tz, str) and tz.strip() for tz in value):
            raise serializers.ValidationError("Each timezone must be a non-empty string.")
        if len(value) > 50:
            raise serializers.ValidationError("Too many timezones specified.")
        return value
    
    def validate_flag(self, value):
        """Validate the flag URL."""
        if value and not re.match(r'^https?://[^\s<>"]+|www\.[^\s<>"]+$', value):
            raise serializers.ValidationError("Invalid URL format for flag.")
        return value or ""
    
    def validate_cca2(self, value):
        """Validate the 2-letter country code."""
        if value and not re.match(r'^[A-Z]{2}$', value):
            raise serializers.ValidationError("cca2 must be a 2-letter uppercase code.")
        return value or ""
    
    def validate_is_active(self, value):
        """Validate the is_active field."""
        if not isinstance(value, bool):
            raise serializers.ValidationError("is_active must be a boolean value.")
        return value
    
    def validate(self, data):
        """Object-level validation."""
        if not any(data.get(key) for key in ['languages', 'currencies', 'timezones']):
            raise serializers.ValidationError(
                "At least one of languages, currencies, or timezones should be provided."
            )
        return data
    
    class Meta:
        model = CountryInfo
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')
        