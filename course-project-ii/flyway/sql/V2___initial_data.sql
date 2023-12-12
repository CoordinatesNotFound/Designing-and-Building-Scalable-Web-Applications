INSERT INTO courses (name) VALUES ('Designing and Building Scalable Web Applications');
INSERT INTO courses (name) VALUES ('Web Application Development');
INSERT INTO courses (name) VALUES ('Full Stack Development');

INSERT INTO questions (content, course_id, votes, created_by)
SELECT
  'demo question 1.' || (n),
  1,
  0,
  'admin'
FROM generate_series(1, 50) n;

INSERT INTO questions (content, course_id, votes, created_by)
SELECT
  'demo question 2.' || (n),
  2,
  0,
  'admin'
FROM generate_series(1, 50) n;

INSERT INTO answers (content, question_id, votes, created_by)
SELECT
  'demo answer 1.1.' || (n),
  1,
  0,
  'admin'
FROM generate_series(1, 50) n;

INSERT INTO answers (content, question_id, votes, created_by)
SELECT
  'demo answer 1.2.' || (n),
  2,
  0,
  'admin'
FROM generate_series(1, 50) n;

-- INSERT INTO questions (content, course_id, votes, created_by) VALUES ('demo question 1?', 2, 0, 'admin');
-- INSERT INTO questions (content, course_id, votes, created_by) VALUES ('What is Redis?', 2, 0, 'admin');
-- INSERT INTO questions (content, course_id, votes, created_by) VALUES ('What is cache?', 2, 0, 'admin');
-- INSERT INTO questions (content, course_id, votes, created_by) VALUES ('What is rabbitmq?', 2, 0, 'admin');
-- INSERT INTO questions (content, course_id, votes, created_by) VALUES ('What is js?', 2, 0, 'admin');
-- INSERT INTO questions (content, course_id, votes, created_by) VALUES ('What is css?', 2, 0, 'admin');
-- INSERT INTO questions (content, course_id, votes, created_by) VALUES ('What is svelte?', 2, 0, 'admin');
-- INSERT INTO questions (content, course_id, votes, created_by) VALUES ('What is tailwindcss?', 2, 0, 'admin');
-- INSERT INTO questions (content, course_id, votes, created_by) VALUES ('What is socket?', 2, 0, 'admin');
-- INSERT INTO questions (content, course_id, votes, created_by) VALUES ('What is message broker?', 2, 0, 'admin');
-- INSERT INTO questions (content, course_id, votes, created_by) VALUES ('What is nginx?', 2, 0, 'admin');

-- INSERT INTO answers (content, question_id, votes, created_by) VALUES ('It is a technology', 1, 0, 'admin');
-- INSERT INTO answers (content, question_id, votes, created_by) VALUES ('It improves scalability', 1, 0, 'admin');
-- INSERT INTO answers (content, question_id, votes, created_by) VALUES ('It is good', 1, 0, 'admin');
-- INSERT INTO answers (content, question_id, votes, created_by) VALUES ('It cool', 1, 0, 'admin');
-- INSERT INTO answers (content, question_id, votes, created_by) VALUES ('I dont know', 1, 0, 'admin');
-- INSERT INTO answers (content, question_id, votes, created_by) VALUES ('Yes it does', 1, 0, 'admin');
-- INSERT INTO answers (content, question_id, votes, created_by) VALUES ('no idea', 1, 0, 'admin');
-- INSERT INTO answers (content, question_id, votes, created_by) VALUES ('IT', 1, 0, 'admin');
-- INSERT INTO answers (content, question_id, votes, created_by) VALUES ('good job', 1, 0, 'admin');
-- INSERT INTO answers (content, question_id, votes, created_by) VALUES ('Thank you', 1, 0, 'admin');
