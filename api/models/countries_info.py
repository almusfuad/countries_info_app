from django.db import models


class CountryInfo(models.Model):
    """Model to store country information.
    This model stores information about countries, including their name, capital,
    population, area, and region.
    """
    
    name = models.CharField(max_length=200, unique=True)
    capital = models.CharField(max_length=200, blank=True, default="")
    region = models.CharField(max_length=200, blank=True, default="")
    subregion = models.CharField(max_length=200, blank=True, default="")
    population = models.BigIntegerField(default=0)
    area = models.FloatField(default=0.0)
    
    # Use JSONField for languages, currencies, and timezones
    languages = models.JSONField(default=list)
    currencies = models.JSONField(default=list)
    timezones = models.JSONField(default=list)
    flag = models.URLField(max_length=200, blank=True, default="")
    
    # Add a timestamp for tracking when the data was last updated
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name
    
    
    class Meta:
        verbose_name_plural = "Country Info"
        ordering = ["name"]