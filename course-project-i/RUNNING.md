# Running steps

Note: the development environment of the application is MacOS, so the first line (base image) of some Dockerfile is different from walking skeleton

## Before running

Before starting the application, you may need to run the following commands in the root of source code folder, otherwise there can be unknown errors.

```
docker compose down 
docker system prune -a
docker volume prune

docker build -t grader-image ./grader-image
```


## Running the application (development configuration)

To start the application (development configuration), open the terminal in the root of source code folder, then run `docker compose up`.


## Running the application (production configuration)  

To start the application (production configuration), open the terminal in the root of source code folder, then run `docker compose -f ./docker-compose.prod.yml up -d`.

## Shutting down the application

To shut down the application, press `Ctrl+C` in the same terminal.

## Running Playwrite tests

To run playwrite tests, open the terminal in the root of source code folder, then run `docker compose run --entrypoint=npx e2e-playwright playwright test && docker compose rm -sf`. (It may fail at the first time, please try again then)
