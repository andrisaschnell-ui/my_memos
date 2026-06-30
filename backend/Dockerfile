FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download the Whisper model during build phase to avoid runtime download timeouts and out-of-memory errors on Railway
RUN python -c "from faster_whisper import WhisperModel; WhisperModel('tiny', device='cpu', compute_type='int8')"

COPY . .

RUN mkdir -p /app/uploads

ENV PORT=8000
CMD sh -c "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"
