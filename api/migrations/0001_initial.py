# Generated by Django 5.2 on 2025-05-05 09:39

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='CountryInfo',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200, unique=True)),
                ('capital', models.CharField(blank=True, default='', max_length=200)),
                ('region', models.CharField(blank=True, default='', max_length=200)),
                ('subregion', models.CharField(blank=True, default='', max_length=200)),
                ('population', models.BigIntegerField(default=0)),
                ('area', models.FloatField(default=0.0)),
                ('languages', models.JSONField(default=list)),
                ('currencies', models.JSONField(default=list)),
                ('timezones', models.JSONField(default=list)),
                ('flag', models.URLField(blank=True, default='')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name_plural': 'Country Info',
                'ordering': ['name'],
            },
        ),
    ]
