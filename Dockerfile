FROM node:9

# Update the repositories and install some dependencies
RUN apt update \
    && apt install -y supervisor \
    && mkdir -p /logs \
    && mkdir -p /shared  \
    && mkdir -p /conf

COPY . /app
COPY ./docker/supervisor.conf /etc/supervisor/conf.d/app.conf

WORKDIR /app

CMD ["supervisord", "--nodaemon", "-c", "/etc/supervisor/supervisord.conf"]
