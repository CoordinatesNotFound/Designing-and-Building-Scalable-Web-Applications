# Grader API - d8b2db3c-d96a-48e0-8175-4edd6d9b5209

Provides an endpoint for grading programming assignments. Has the functionality
needed to create a grader image based on `grader-image` and to copy source code
and test code to the image.

When the grader API is run, the Docker daemon should be exposed to the grader
API to allow running the created Docker images.

This is done by mapping the docker daemon socket to the grader api in the
`docker-compose.yml` file, e.g.

```
# ...
  grader-api:
    build: grader-api
    image: grader-api
    restart: "no"
    volumes:
      - ./grader-api/:/app
      - ./app-cache/:/app-cache
      - "/var/run/docker.sock:/var/run/docker.sock"
    ports:
      - 7000:7000
# ...
```
