# Generated by Django 5.2.3 on 2025-06-29 09:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0008_savedplace_amenity_visitedplace_amenity"),
    ]

    operations = [
        migrations.CreateModel(
            name="CulturalSite",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(max_length=255)),
                ("category", models.CharField(blank=True, max_length=100, null=True)),
                ("tourism", models.CharField(blank=True, max_length=100, null=True)),
                ("amenity", models.CharField(blank=True, max_length=100, null=True)),
                ("city", models.CharField(blank=True, max_length=100, null=True)),
                ("postcode", models.CharField(blank=True, max_length=20, null=True)),
                ("street", models.CharField(blank=True, max_length=200, null=True)),
                ("district", models.CharField(blank=True, max_length=100, null=True)),
                ("website", models.URLField(blank=True, null=True)),
                ("phone", models.CharField(blank=True, max_length=40, null=True)),
                ("image", models.URLField(blank=True, null=True)),
                ("lat", models.FloatField()),
                ("lng", models.FloatField()),
            ],
        ),
        migrations.RemoveField(
            model_name="savedplace",
            name="amenity",
        ),
        migrations.RemoveField(
            model_name="visitedplace",
            name="amenity",
        ),
    ]
