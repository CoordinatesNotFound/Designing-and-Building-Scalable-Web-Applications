FROM bitnami/pytorch

WORKDIR /app

COPY ./requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /app/requirements.txt
COPY ./server/models.py /app/server/models.py
ENV TRANSFORMERS_CACHE=/app/.cache
RUN python /app/server/models.py
COPY ./server/ /app/server/

CMD ["uvicorn", "server.main:app", "--host", "0.0.0.0", "--port", "7000"]
