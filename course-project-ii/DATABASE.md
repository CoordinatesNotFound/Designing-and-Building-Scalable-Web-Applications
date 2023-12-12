# Database design



## Schema & indexes

```postgresql
CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  course_id  INTEGER REFERENCES courses(id),
  votes INTEGER NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE answers (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  question_id  INTEGER REFERENCES questions(id),
  votes INTEGER NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE question_votes (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES questions(id),
    user_uuid TEXT NOT NULL
);

CREATE TABLE answer_votes (
    id SERIAL PRIMARY KEY,
    answer_id INTEGER REFERENCES answers(id),
    user_uuid TEXT NOT NULL
);


CREATE INDEX idx_questions_created_by ON questions(created_by);

CREATE INDEX idx_answers_created_by ON answers(created_by);

CREATE INDEX idx_question_votes ON question_votes (question_id, user_uuid);

CREATE INDEX idx_answer_votes ON answer_votes (answer_id, user_uuid);
```



## Cache

Redis is utilized to cache database query results. Also, cache purge mechanisms are in place.