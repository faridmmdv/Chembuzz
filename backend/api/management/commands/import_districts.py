import json
from django.core.management.base import BaseCommand
from api.models import CulturalSite  # Or your District model

class Command(BaseCommand):
    help = 'Import districts from Stadtteile.geojson as districts'

    def add_arguments(self, parser):
        parser.add_argument('geojson_file', type=str)

    def handle(self, *args, **options):
        path = options['geojson_file']
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        count = 0
        for feat in data['features']:
            props = feat.get('properties', {})
            name = props.get('STADTTNAME')
            if not name:
                continue
            # Compute centroid of polygon for lat/lng (simple average)
            coords = feat.get('geometry', {}).get('coordinates')
            if not coords or not coords[0]:
                continue
            poly = coords[0]
            avg_lng = sum(pt[0] for pt in poly) / len(poly)
            avg_lat = sum(pt[1] for pt in poly) / len(poly)
            # Save as CulturalSite with only district name and lat/lng
            CulturalSite.objects.get_or_create(
                name=name,
                district=name,
                city="Chemnitz",
                lat=avg_lat,
                lng=avg_lng,
            )
            count += 1
        self.stdout.write(self.style.SUCCESS(f"Imported {count} districts as CulturalSites"))
