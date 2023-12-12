#FROM denoland/deno:alpine-1.26.2
FROM lukechannings/deno:v1.37.0

EXPOSE 7776

WORKDIR /app

COPY deps.js .

RUN deno cache deps.js

COPY . .

CMD ["run", "--allow-net", "--allow-read", "--allow-run", "--allow-env", "--allow-write", "--watch", "app.js" ]
