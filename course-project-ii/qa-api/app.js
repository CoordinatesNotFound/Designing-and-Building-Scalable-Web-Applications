import { connect, serve } from "./deps.js";
import * as courseService from "./services/course.js";
import * as questionService from "./services/question.js";
import * as answerService from "./services/answer.js";
import { cacheMethodCalls } from "./util/cacheUtil.js";

// cached services
const cachedCourseService = cacheMethodCalls(
  courseService,
  [],
);

const cachedQuestionService = cacheMethodCalls(
  questionService,
  ["addQuestion", "updateVotes"],
);

const cachedAnswerService = cacheMethodCalls(
  answerService,
  ["addAnswer", "updateVotes"],
);

// connect to rabbitmq
const connectionOptions = {
  hostname: "mq", // RabbitMQ server hostname or IP address
  port: 5672, // RabbitMQ server port
};

let isReachable = false;
let connection;
let maxTry = 0;

while (isReachable === false && maxTry < 6) {
  try {
    connection = await connect(connectionOptions);
    isReachable = true;
  } catch (e) {
    maxTry++;
    console.log("app waits for mq...");
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
}

const channel = await connection.openChannel();
const queueName = "sse.queue";

// handles
const handleGetCourses = async (request) => {
  return Response.json(await cachedCourseService.findAll());
};

const handleGetQuestions = async (request, urlPatternResult) => {
  const course_id = urlPatternResult.pathname.groups.id;
  let res = await cachedQuestionService.findByCourseId(course_id);
  return Response.json(res.sort((a, b) => {
    const a_date = new Date(a.last_updated);
    const b_date = new Date(b.last_updated);
    return b_date - a_date;
  }));
};

const handleGetAnswers = async (request, urlPatternResult) => {
  const question_id = urlPatternResult.pathname.groups.id;
  let res = await cachedAnswerService.findByQuestionId(question_id);
  return Response.json(res.sort((a, b) => {
    const a_date = new Date(a.last_updated);
    const b_date = new Date(b.last_updated);
    return b_date - a_date;
  }));
};

const handleGetQuestion = async (request, urlPatternResult) => {
  const id = urlPatternResult.pathname.groups.id;
  return Response.json(await cachedQuestionService.findById(id));
};

const handleCheckQuestionVote = async (request, urlPatternResult) => {
  const question_id = urlPatternResult.pathname.groups.qId;
  const user_uuid = urlPatternResult.pathname.groups.uId;
  const voted = await cachedQuestionService.findVote(question_id, user_uuid);
  return Response.json({ voted });
};

const handleCheckAnswerVote = async (request, urlPatternResult) => {
  const answer_id = urlPatternResult.pathname.groups.aId;
  const user_uuid = urlPatternResult.pathname.groups.uId;
  const voted = await cachedAnswerService.findVote(answer_id, user_uuid);
  return Response.json({ voted });
};

const handlePostQuestion = async (request, urlPatternResult) => {
  const course_id = urlPatternResult.pathname.groups.id;
  const requestData = await request.json();
  const content = requestData.content;
  const user_uuid = requestData.user_uuid;

  // check 1 min
  const last_created = await cachedQuestionService.findLastCreatedByUser(user_uuid);

  if (last_created) {
    const currentTimestamp = Date.now();
    const timeDifference = currentTimestamp - (new Date(last_created)).getTime();

    // time less than 1 min
    if (timeDifference < 60 * 1000) {
      return new Response(
        JSON.stringify({
          error: "You can only post one question in one minute",
        }),
        {
          status: 429,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  }

  // add question
  const res = await cachedQuestionService.addQuestion(
    content,
    course_id,
    0,
    user_uuid,
  );

  // construct data for sse
  const dataForSse = {
    ...res,
    type: "question",
  };

  // publish data to sse
  await channel.publish(
    { routingKey: queueName },
    { contentType: "application/json" },
    new TextEncoder().encode(JSON.stringify(dataForSse)),
  );

  console.log("added question", res);

  // maybe simply return the id
  return new Response(JSON.stringify(res));
};

const handlePostAnswer = async (request, urlPatternResult) => {
  const question_id = urlPatternResult.pathname.groups.id;
  const requestData = await request.json();
  const content = requestData.content;
  const user_uuid = requestData.user_uuid;

  // check 1 min
  const last_created = await cachedAnswerService.findLastCreatedByUser(user_uuid);
  console.log("lasest", last_created)

  if (last_created) {
    const currentTimestamp = Date.now();
    const timeDifference = currentTimestamp - (new Date(last_created)).getTime();
    console.log("time", timeDifference)

    // time less than 1 min
    if (timeDifference < 60 * 1000) {
      return new Response(
        JSON.stringify({
          error: "You can only post one question in one minute.",
        }),
        {
          status: 429,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  }


  // create answer
  const res = await cachedAnswerService.addAnswer(
    content,
    question_id,
    0,
    user_uuid,
  );

  // construct data for sse
  const dataForSse = {
    ...res,
    type: "answer",
  };

  // publish data to sse
  await channel.publish(
    { routingKey: queueName },
    { contentType: "application/json" },
    new TextEncoder().encode(JSON.stringify(dataForSse)),
  );

  console.log(res);

  // maybe simply return the id
  return new Response(JSON.stringify(res));
};

const handleUpvoteQuestion = async (request, urlPatternResult) => {
  const id = urlPatternResult.pathname.groups.id;
  const requestData = await request.json();
  const user_uuid = requestData.user_uuid;
  await cachedQuestionService.updateVotes(id, user_uuid);

  // todo: determine what to return (not matter)
  return new Response(JSON.stringify({ id }));
};

const handleUpvoteAnswer = async (request, urlPatternResult) => {
  const id = urlPatternResult.pathname.groups.id;
  const requestData = await request.json();
  const user_uuid = requestData.user_uuid;
  await cachedAnswerService.updateVotes(id, user_uuid);

  // todo: determine what to return (not matter)
  return new Response(JSON.stringify({ id }));
};

const handleLlmRequest = async (request) => {
  // get 3 answers from llm-api
  const requestData = await request.json();

  let answers = [];

  for (let i = 0; i < 3; i++) {
    console.log("Fetching answer ", i + 1);

    const response = await fetch("http://llm-api:7000/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    const answer = await response.json();

    answers = answers.concat(answer[0]["generated_text"]);
  }

  // add the 3 answers
  const question_id = requestData.question_id;
  const user_uuid = requestData.user_uuid

  answers.forEach(async (answer) => {
    const content = answer;
    await cachedAnswerService.addAnswer(
      content,
      question_id,
      0,
      user_uuid
    );
  });

  return new Response(JSON.stringify(answers));
};

// map: url -> handleXxx
const urlMapping = [
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/courses" }),
    fn: handleGetCourses,
  },
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/courses/:id/questions" }),
    fn: handleGetQuestions,
  },
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/questions/:id" }),
    fn: handleGetQuestion,
  },
  {
    method: "GET",
    pattern: new URLPattern({
      pathname: "/questions/:id/answers",
    }),
    fn: handleGetAnswers,
  },
  {
    method: "GET",
    pattern: new URLPattern({
      pathname: "/questions/:qId/vote/:uId",
    }),
    fn: handleCheckQuestionVote,
  },
  {
    method: "GET",
    pattern: new URLPattern({
      pathname: "/answers/:aId/vote/:uId",
    }),
    fn: handleCheckAnswerVote,
  },
  {
    method: "POST",
    pattern: new URLPattern({ pathname: "/courses/:id/questions" }),
    fn: handlePostQuestion,
  },
  {
    method: "POST",
    pattern: new URLPattern({
      pathname: "/questions/:id/answers",
    }),
    fn: handlePostAnswer,
  },
  {
    method: "PUT",
    pattern: new URLPattern({ pathname: "/questions/:id" }),
    fn: handleUpvoteQuestion,
  },
  {
    method: "PUT",
    pattern: new URLPattern({
      pathname: "/answers/:id",
    }),
    fn: handleUpvoteAnswer,
  },
  {
    method: "POST",
    pattern: new URLPattern({
      pathname: "/llm-api",
    }),
    fn: handleLlmRequest,
  },
];

// handle the request to qa-api
const handleRequest = async (request) => {
  const mapping = urlMapping.find(
    (um) => um.method === request.method && um.pattern.test(request.url),
  );

  if (!mapping) {
    return new Response("Not found", { status: 404 });
  }

  const mappingResult = mapping.pattern.exec(request.url);
  try {
    return await mapping.fn(request, mappingResult);
  } catch (e) {
    console.log(e);
    return new Response(e.stack, { status: 500 });
  }
};

// start the server
const portConfig = { port: 7777, hostname: "0.0.0.0" };
serve(handleRequest, portConfig);
