FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PORT=80
EXPOSE 80

CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:${PORT:-80} app:app"]
