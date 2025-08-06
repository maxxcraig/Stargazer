from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
import math
from datetime import datetime
from .models import Star, Constellation, ConstellationLine, Planet
from .serializers import StarSerializer, ConstellationSerializer, ConstellationLineSerializer, PlanetSerializer

class StarViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Star.objects.all()
    serializer_class = StarSerializer
    
    @action(detail=False, methods=['get'])
    def visible_stars(self, request):
        lat = float(request.query_params.get('lat', 0))
        lon = float(request.query_params.get('lon', 0))
        timestamp = request.query_params.get('timestamp', datetime.now().isoformat())
        magnitude_limit = float(request.query_params.get('magnitude_limit', 6.0))
        
        # Get stars visible at given location and time
        stars = Star.objects.filter(magnitude__lte=magnitude_limit)
        
        # Convert to horizontal coordinates and filter visible stars
        visible_stars = []
        for star in stars:
            alt, az = self.equatorial_to_horizontal(star.ra, star.dec, lat, lon, timestamp)
            if alt > 0:  # Above horizon
                star_data = StarSerializer(star).data
                star_data['altitude'] = alt
                star_data['azimuth'] = az
                visible_stars.append(star_data)
        
        return Response(visible_stars)
    
    def equatorial_to_horizontal(self, ra, dec, lat, lon, timestamp):
        # Simplified coordinate transformation
        # In production, use proper astronomical libraries like pyephem or astropy
        dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
        
        # Calculate Local Sidereal Time (simplified)
        j2000_epoch = datetime(2000, 1, 1, 12, 0, 0)
        days_since_j2000 = (dt - j2000_epoch).total_seconds() / 86400.0
        lst = (280.16 + 360.9856235 * days_since_j2000 + lon) % 360
        
        # Hour angle
        ha = (lst - ra) % 360
        if ha > 180:
            ha -= 360
        
        # Convert to radians
        ha_rad = math.radians(ha)
        dec_rad = math.radians(dec)
        lat_rad = math.radians(lat)
        
        # Calculate altitude and azimuth
        alt_rad = math.asin(
            math.sin(dec_rad) * math.sin(lat_rad) + 
            math.cos(dec_rad) * math.cos(lat_rad) * math.cos(ha_rad)
        )
        
        az_rad = math.atan2(
            -math.sin(ha_rad),
            math.tan(dec_rad) * math.cos(lat_rad) - math.sin(lat_rad) * math.cos(ha_rad)
        )
        
        return math.degrees(alt_rad), (math.degrees(az_rad) + 360) % 360

class ConstellationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Constellation.objects.all()
    serializer_class = ConstellationSerializer
    
    @action(detail=True, methods=['get'])
    def lines(self, request, pk=None):
        constellation = self.get_object()
        lines = ConstellationLine.objects.filter(constellation=constellation)
        serializer = ConstellationLineSerializer(lines, many=True)
        return Response(serializer.data)
