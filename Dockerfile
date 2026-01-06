# Usar imagen oficial ligera de Python
FROM python:3.11-slim

# Evita que Python escriba archivos .pyc y bufferee stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Directorio de trabajo en el contenedor
WORKDIR /app

# Instalar dependencias del sistema si fueran necesarias
# RUN apt-get update && apt-get install -y gcc

# Copiar requirements e instalar
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el código fuente
COPY main.py .
# (Opcional) Copiar otros archivos si tu backend crece
# COPY modules/ ./modules/

# Puerto que escucha Cloud Run (por defecto 8080)
PORT 8080
EXPOSE 8080

# Comando de inicio usando Uvicorn
# --host 0.0.0.0 es crítico para contenedores
CMD exec uvicorn main:app --host 0.0.0.0 --port ${PORT} --workers 1
