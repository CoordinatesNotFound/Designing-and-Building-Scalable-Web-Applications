# Designing and Building Scalable Web Applications / Course Project II



## Key design decisions
The application should pass with merits:
- Basic Q&A functionality
  - The main page lists available courses and allows selecting a course, which opens up the course page.
  - The course page shows the functionality for creating new questions, listing questions, upvoting questions, and selecting questions (which opens up the question page).
  - The question page shows the question and includes the functionality for answering the question, listing answers, and upvoting answers.
  - Each user can upvote each question and answer at most once.
  - The questions and answers are sorted and shown based on recency that accounts for both the posting time and the last upvote time, whichever is more recent. The most recent questions/answers are at the top of the list.
  - A single user (defined by the user uuid) can post at most one question and answer per minute. If a user with the same user uuid attempts to post another question or answer within the span of a minute, the question or answer is rejected, and the user is told to wait for a while.

- Generating answers with a large language model
  - When a question is created, the application uses llm-api to generate three answers to the question. The answers are shown on the question page among other answers.
  - The answers are generated asynchronously in the background, and the user does not have to wait for the answers to be generated before the question is shown. 
- Authentication
  - Through the user token which is generated randomly on opening the application for the first time, stored in `localStorage`, and is used to identify the user in the future, the user is identified without registration.
- Configurations
  - The project has both development and production configuration. 
- Database, Schema and Indexes
  - This application uses PostgreSQL as the database.
  - The database schema is well designed and applied via flyway
  - Indexes are in place to improve the database query performance
  - There is sample data in the database that is used for development and testing purposes.
- Cache
  - Redis is utilized to cache database query results. Also, cache purge mechanisms are in place.
- Infinite Scrolling functionality
  - The question list and answer list feature Infinite Scrolling component, so that, when scrolling the list to the bottom of the page, the application retrieves morei items, 20 at a time.

- Message Queue
  - RabbitMQ is used to processed thousands of post operations. The qa-api works as publisher and the sse server work as consumer, ensuring question/answer posts processed one by one.

- Server-Sent Event 
  - Server-sent event in use to allow the content shown to the user to be updated automatically without a need to refresh the page.
    - If the user is on the course page, new questions are added to the top of the question list.
    - If the user is on the question page, new answers to the question are added to the top of the answer list.
    - There is no mis-updating, i.e. the updates in one course/question page will not affect another course/question page.
- Kubernetes configurations
  - This application has a set of Kubernetes configuration files with automatic scaling that can be used to deploy the application to Kubernetes.
  - The Kubernetes configuration files also include a set of configuration files for monitoring the application with Prometheus and Grafana. 
- Testing & Documentation
  - E2e Playwrite tests and K6 performance tests are good. 
  - Documentation is well done.
- User Interface
  - TailwindCSS is used for styling the application, making the application more usable. 
  - The styling is consistent and nice.
  - Notify component is in place for error or success notification, with two colors.



## Possible improvements
- Network communication still uses the HTTP1.1. Perhaps HTTP2 can be applied to improve the performance

- Since database is a bottleneck, there must be methods to improve the database efficiency. Like the schema of database can be better designed.
- The kubernetes configuration only consider single node of many service (such as rabbitmq, redis, llm-api...). If they can be deployed as clusters, it must improve a lot.
- The Content-Delivery Networks might be used to improve the overall performance.