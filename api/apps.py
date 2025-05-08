from django.apps import AppConfig
import sys
import os


class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self):
        """
        Execute code when the app is ready.
        """
        import api.urls.countries
        
        # Check for the RUN_MAIN environment variable set by runserver.
        is_runserver = 'runserver' in sys.argv
        is_main_process = os.environ.get('RUN_MAIN') == 'true'
        
        if is_runserver and is_main_process:
            from api.utils.fetch_countries import populate_database
            
            
            try:
                # Populate the database with the initial data.
                populate_database()
            except Exception as e:
                print(f"Error: Failed to populate the database: {e}")
                sys.exit(1)
                