from django.core.management.base import BaseCommand
from api.utils.fetch_countries import populate_database


class Command(BaseCommand):
    help = "Populate the database with country information from the API."
    
    def handle(self, *args, **kwargs):
        self.stdout.write("Starting database population...")
        populate_database()
        self.stdout.write(self.style.SUCCESS("Database population completed successfully."))
    