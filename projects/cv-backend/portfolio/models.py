from django.db import models

class Experience(models.Model):
    role = models.CharField(max_length=100)
    company = models.CharField(max_length=100)
    start_date = models.CharField(max_length=20)  # Ej: "2018"
    end_date = models.CharField(max_length=20, blank=True, null=True)  # Ej: "Actualidad"
    description = models.TextField()

    def __str__(self):
        return f"{self.role} en {self.company}"
