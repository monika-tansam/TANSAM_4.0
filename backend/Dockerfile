FROM python:3.11.14-slim-bookworm@sha256:65a93d69fa75478d554f4ad27c85c1e69fa184956261b4301ebaf6dbb0a3543d
ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1 PIP_DISABLE_PIP_VERSION_CHECK=1
WORKDIR /app
COPY requirements.lock ./
RUN pip install --no-cache-dir --require-hashes -r requirements.lock \
    && useradd --uid 10001 --create-home tansy \
    && mkdir -p /var/lib/tansy /backups /knowledge \
    && chown -R tansy:tansy /var/lib/tansy /backups /knowledge
COPY --chown=tansy:tansy . ./
USER 10001:10001
EXPOSE 5001
CMD ["gunicorn", "--no-control-socket", "--bind", "0.0.0.0:5001", "--workers", "2", "--threads", "4", "--timeout", "180", "--access-logfile", "-", "--error-logfile", "-", "app:app"]
