import json
from django.core.management.base import BaseCommand
from api.models import SavedPlace
from django.contrib.auth.models import User

class Command(BaseCommand):
    help = 'Import sites from a GeoJSON file into the SavedPlace model'

    def add_arguments(self, parser):
        parser.add_argument('geojson_file', type=str)

    def handle(self, *args, **options):
        path = options['geojson_file']
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Get or create a default user 
        user, _ = User.objects.get_or_create(username='admin', defaults={'password': 'admin'})

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
            SavedPlace.objects.get_or_create(
                user=user,
                name=name,
                tourism=props.get('tourism'),
                city=props.get('addr:city'),
                postcode=props.get('addr:postcode'),
                street=props.get('addr:street'),
                district=props.get('suburb') or props.get('addr:suburb'),
                website=props.get('website'),
                image=props.get('image'),
                lat=lat,
                lng=lng,
            )
            count += 1
        self.stdout.write(self.style.SUCCESS(f"Imported {count} places from {path}"))
