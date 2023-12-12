import { Application, connect, Router, ServerSentEvent } from "./deps.js";

// connection set
const connsForQuestions = new Map();
const connsForAnswers = new Map();

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

// declare channel and queue
const channel = await connection.openChannel();
const queueName = "sse.queue";
await channel.declareQueue({ queue: queueName });

// consume data from rabbitmq
await channel.consume(
  { queue: queueName },
  async (args, props, data) => {

    // construct the message
    const JSONdata = JSON.parse(new TextDecoder().decode(data));
    console.log("data received", JSONdata);
    const message = JSONdata;

    // get the conns from conns map
    let conns;
    if (message.type == "question") {
      console.log("message type: question");
      conns = connsForQuestions.get(`${message["course_id"]}`);
    } else if(message.type == "answer"){
      console.log("message type: answer");
      conns = connsForAnswers.get(`${message["question_id"]}`);
    } else{
      console.log("mesasage type error");
    }

    if(conns != undefined){
      // dispatch the message
      console.log("conns", conns)
      conns.forEach((conn) => {
        conn.dispatchMessage(message);
      });
      console.log("message sent to", conns.size, "connections");
    }
    
    await channel.ack({ deliveryTag: args.deliveryTag });
  },
);

const app = new Application({
  logErrors: false,
});

const router = new Router();

// the router for questions (conns grouped by course id)
router.get("/sse/courses/:cId", (ctx) => {

  // get course id
  const { cId } = ctx.params;

  // get target
  const headers = new Headers([["X-Accel-Buffering", "no"]]);
  const target = ctx.sendEvents({ headers });

  // close connection
  target.addEventListener("close", () => {
    console.log("delete conn...");
    connsForQuestions.get(cId).delete(target);
  });

  // store the target to map
  console.log("add conn...", target);
  if (!connsForQuestions.has(cId)) {
    connsForQuestions.set(cId, new Set());
  }
  connsForQuestions.get(cId).add(target);

});

// the router for answers (conns grouped by question id)
router.get("/sse/questions/:qId", (ctx) => {

  // get question id
  const { qId } = ctx.params;

  // get target
  const headers = new Headers([["X-Accel-Buffering", "no"]]);
  const target = ctx.sendEvents({ headers });

  // close connection
  target.addEventListener("close", () => {
    console.log("delete conn...");
    connsForAnswers.get(qId).delete(target);
  });

  // store the target to map
  console.log("add conn...", target);
  if (!connsForAnswers.has(qId)) {
    connsForAnswers.set(qId, new Set());
  }
  connsForAnswers.get(qId).add(target);

});

app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 7776 });
