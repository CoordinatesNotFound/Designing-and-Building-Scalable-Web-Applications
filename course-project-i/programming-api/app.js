import * as programmingAssignmentService from "./services/programmingAssignmentService.js";
import { serve } from "./deps.js";
import { cacheMethodCalls } from "./util/cacheUtil.js";
import { connect } from "./deps.js";

// cache
const cachedProgrammingAssignmentService = cacheMethodCalls(
  programmingAssignmentService,
  ["addSubmission"],
);

// connect to rabbitmq
const connectionOptions = {
  hostname: "mq", // RabbitMQ server hostname or IP address
  port: 5672,             // RabbitMQ server port
};

let isReachable = false
let connection
let maxTry = 0;

while (isReachable === false && maxTry < 6){
  try{
    connection = await connect(connectionOptions);
    isReachable = true;
  }catch(e){
    maxTry++;
    console.log("app waits for mq...")
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
}

const channel = await connection.openChannel();
const queueName = "grader.queue";

// handles
const handleGetAssignment = async (request, urlPatternResult) => {
  const id = urlPatternResult.pathname.groups.id;
  return Response.json(await cachedProgrammingAssignmentService.getAssignment(id))
};

const handlePostSubmission = async (request) => {
  // assuming that the request has a json object and that
  // the json object has a property name
  const requestData = await request.json();
  const user = requestData.user;
  const assignmentId = requestData.assignment;
  const code = requestData.code;

  // check whether same submission exists
  const existSubmission = await cachedProgrammingAssignmentService
    .getSubmissionByAssignmentAndCode(assignmentId, code);

  const assignment = await cachedProgrammingAssignmentService.getAssignment(
    assignmentId,
  );

  // if doesn't exist
  if (!existSubmission) {
    // store the new submission to database
    const submissionId = await cachedProgrammingAssignmentService.addSubmission(
      user,
      assignmentId,
      code,
    );

    // construct data for grading
    const dataForGrade = {
      testCode: assignment["test_code"],
      code: code,
      submissionId: submissionId
    };

    // send code to grader (publish)
    await channel.publish(
      { routingKey: queueName },
      { contentType: "application/json" },
      new TextEncoder().encode(JSON.stringify(dataForGrade)),
    );
      console.log("data published", dataForGrade)

    // return new submission id
    return Response.json({
      submissionId: submissionId,
    });
  }

  // return existing submission id
  return Response.json({
    submissionId: existSubmission,
  });
};

const handleSSE = async (request, urlPatternResult) => {
  const submissionId = urlPatternResult.pathname.groups.submissionId;

  let interval;

  const body = new ReadableStream({
    start(controller) {
      console.log(submissionId, "sse connection built (server side)")
      interval = setInterval(async() => {
        const submission = await cachedProgrammingAssignmentService.getSubmission(submissionId);

        const messageData = JSON.stringify({
          submissionId: submissionId,
          status: submission.status,
          graderFeedback: submission.grader_feedback,
          correct: submission.correct
        })
        console.log(messageData)
        const message = new TextEncoder().encode(`data: ${messageData}\n\n`);
        controller.enqueue(message);
      }, 3000);
    },
    cancel() {
      console.log(submissionId, "sse connection closed (server side)")
      clearInterval(interval);
    },
  });

  return new Response(body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Access-Control-Allow-Origin": "*",
      "Connection": "keep-alive",
      // "Cache-Control": "no-cache, no-transform",
    },
  });
}

// map: url -> handleXxx
const urlMapping = [
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/assignment/:id" }),
    fn: handleGetAssignment,
  },
  {
    method: "POST",
    pattern: new URLPattern({ pathname: "/submission" }),
    fn: handlePostSubmission,
  },
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/sse/:submissionId" }),
    fn: handleSSE,
  }

];

// handle the request to programming-api
const handleRequest = async (request) => {
  const mapping = urlMapping.find(
    (um) =>  um.method === request.method && um.pattern.test(request.url) ,
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