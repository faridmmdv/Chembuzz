import json
from django.core.management.base import BaseCommand
from api.models import CulturalSite

class Command(BaseCommand):
    help = 'Import Chemnitz.geojson cultural sites'

    def add_arguments(self, parser):
        parser.add_argument('geojson_file', type=str)

    def handle(self, *args, **options):
        path = options['geojson_file']
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        count = 0
        for feat in data['features']:
            if feat.get('geometry', {}).get('type') != 'Point':
                continue
            coords = feat.get('geometry', {}).get('coordinates', None)
            if not coords or len(coords) != 2:
                continue
            lng, lat = coords
            props = feat.get('properties', {})

            name = props.get('name')
            if not name:
                continue

            # Prefer 'tourism', but fallback to 'amenity' if no tourism field
            tourism = props.get('tourism')
            amenity = props.get('amenity')
            category = tourism if tourism else amenity

            CulturalSite.objects.get_or_create(
                name=name,
                category=category,
                tourism=tourism,
                amenity=amenity,
                city=props.get('addr:city'),
                postcode=props.get('addr:postcode'),
                street=props.get('addr:street'),
                district=props.get('suburb') or props.get('addr:suburb'),
                website=props.get('website'),
                image=props.get('image'),
                phone=props.get('phone'),
                lat=lat,
                lng=lng,
            )
            count += 1
        self.stdout.write(self.style.SUCCESS(f"Imported {count} Chemnitz cultural places"))
