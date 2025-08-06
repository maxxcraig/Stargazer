from rest_framework import serializers
from .models import Star, Constellation, ConstellationLine, Planet

class StarSerializer(serializers.ModelSerializer):
    class Meta:
        model = Star
        fields = ['id', 'hip_id', 'name', 'ra', 'dec', 'magnitude', 'spectral_class']

class ConstellationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Constellation
        fields = ['id', 'name', 'abbreviation']

class ConstellationLineSerializer(serializers.ModelSerializer):
    star1 = StarSerializer(read_only=True)
    star2 = StarSerializer(read_only=True)
    
    class Meta:
        model = ConstellationLine
        fields = ['constellation', 'star1', 'star2']

class PlanetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Planet
        fields = ['id', 'name', 'orbital_elements']