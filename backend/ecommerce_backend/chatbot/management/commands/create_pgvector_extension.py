from django.core.management.base import BaseCommand
from django.db import connection


class Command(BaseCommand):

    help = "Create pgvector extension"

    def handle(self, *args, **kwargs):

        with connection.cursor() as cursor:

            cursor.execute(
                "CREATE EXTENSION IF NOT EXISTS vector;"
            )

        self.stdout.write(
            self.style.SUCCESS(
                "pgvector extension created successfully"
            )
        )