# Designing and Building Scalable Web Applications / Course Project I



## Key design decisions
The application should pass with merits:
1. A main page with a name and a handout of a programming assignment, a textarea where Python code can be written, a button that allows submitting the written program for assessment, and a top bar showing user id and points that users have gotten.
2. RabbitMQ is used to processed thousands of code submissions. The programming-api works as publisher and the grader-apis work as consumer, ensuring submission processed one by one.
3. There are two deployments of grader-api, each equipped with a RabbitMQ consumer which can refetch 200 messages at the same time, guaranteeing the load balance between two grader-apis and ensuring that grader deployments do not end up processing the same submission. The number of deployments can be scaled up by simply modifing the docker-compose.yml file.
4. Server-sent event is in use that allows updating the submission status and users do not need to refresh to see the updated result upon submission.
5. The project has both development and production configuration. 
6. Upon submission, submissions with the same code to the same assignment are looked for from database and only new submission is sent for grading.
7. A single user can have at most one programming assignment submission in grading at a time. Before the previously submitted code being graded, the submit button is disabled.
8. Whenever the user reopens the application, the user is shown the first assignment that they havent't yet completed and points that corresponds to the users' current progress. This is achieved via Svelte's state management with stores.
9. Redis is utilized to cache database query results. Also, cache purge mechanisms are in place.
10. Postgre's database connection pool is used in the grader-api to improve the efficiency of updating grading result.
11. TailwindCSS is used for styling the application, making the application more usable. 
12. E2e Playwrite tests and K6 performance tests are good. Documentation is well done.



## Possible improvements
1. Server-sent event is utilized to update the submission status. It is a mechanism dependent on long polling, so it may be unstable under some circumstances. Also, it rely on the continus queies from database, which may increase database load. Some other mechanisms such as sockets or message queues can be considered to improve this.
2. The database connection pool is only used in grader-api but not in programming-api. The database connection load can be decreased if connection pool is applied to programming-api.
3. Multiple nodes for programming-api can be considered to improve the scalability of application.