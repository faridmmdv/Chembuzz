# Generated by Django 5.2.3 on 2025-06-19 23:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0002_profile"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="profile",
            name="bio",
        ),
        migrations.RemoveField(
            model_name="profile",
            name="phone",
        ),
        migrations.AddField(
            model_name="profile",
            name="dob",
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="profile",
            name="gender",
            field=models.CharField(blank=True, max_length=10),
        ),
    ]
