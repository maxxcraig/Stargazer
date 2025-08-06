from django.db import models
import math

class Star(models.Model):
    hip_id = models.IntegerField(unique=True, null=True, blank=True)
    name = models.CharField(max_length=100, blank=True)
    ra = models.FloatField()  # Right Ascension in degrees
    dec = models.FloatField()  # Declination in degrees
    magnitude = models.FloatField()  # Visual magnitude
    spectral_class = models.CharField(max_length=10, blank=True)
    
    def __str__(self):
        return self.name or f"HIP {self.hip_id}"

class Constellation(models.Model):
    name = models.CharField(max_length=50)
    abbreviation = models.CharField(max_length=3)
    
    def __str__(self):
        return self.name

class ConstellationLine(models.Model):
    constellation = models.ForeignKey(Constellation, on_delete=models.CASCADE)
    star1 = models.ForeignKey(Star, on_delete=models.CASCADE, related_name='line_start')
    star2 = models.ForeignKey(Star, on_delete=models.CASCADE, related_name='line_end')

class Planet(models.Model):
    name = models.CharField(max_length=20)
    orbital_elements = models.JSONField()  # Store orbital parameters
    
    def __str__(self):
        return self.name
