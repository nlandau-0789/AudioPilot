FROM python:3.11-slim

WORKDIR /app

COPY backend ./backend
COPY frontend ./frontend
COPY requirements.txt .
RUN pip install -r requirements.txt

CMD ["python", "backend/server.py"]
