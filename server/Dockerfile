# server/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# ---- system deps ----
# - gcc/build-essential often needed for some python wheels
# - postgresql-client gives you "psql" for seeding
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    curl \
    postgresql-client \
  && rm -rf /var/lib/apt/lists/*

# ---- python deps ----
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# ---- app code ----
COPY . /app

# ---- copy sentence-transformers model into image ----
# Make sure this path exists: server/models/model1 on your host.
# After COPY . /app, it should be at /app/models/model1 if it’s in server/models/model1.
# If your structure is different, adjust the path below.
ENV MODEL_PATH=/app/models/model1

# Flask/Gunicorn settings (optional)
ENV PYTHONUNBUFFERED=1
ENV PORT=5000

EXPOSE 5000

# Default command for the server container (init container will override command)
CMD ["gunicorn", "-k", "eventlet", "-w", "1", "-b", "0.0.0.0:5000", "db_search:app"]
