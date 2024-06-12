from django.apps import AppConfig

class BackendConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'Backend'

    def ready(self):
        # Import signals to connect them on startup
        from . import signals