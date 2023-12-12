import * as programmingAssignmentService from "./services/programmingAssignmentService.js"
import { grade } from "./services/gradingService.js";
// import { updateSubmission } from "./services/exerciseService.js";
import { connect } from "./deps.js";

const connectionOptions = {
  hostname: "mq", // RabbitMQ server hostname or IP address
  port: 5672,             // RabbitMQ server port
};
let isReachable = false
let maxTry = 0;
let connection;

// waiting until connected to mq successfully
while (isReachable === false && maxTry < 6){
  try{
    connection = await connect(connectionOptions);
    isReachable = true;
  }catch(e){
    console.log("grader waits for mq...")
    maxTry++;
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
}

// initiate the channel and queue
const channel = await connection.openChannel();

const queueName = "grader.queue";
await channel.declareQueue({ queue: queueName });

// each consumer only prefetch 200 messages at the same time
await channel.qos({ prefetchCount: 200 });

// consume
await channel.consume(
  { queue: queueName },
  async (args, props, data) => {
    const JSONdata = JSON.parse(new TextDecoder().decode(data));
    console.log("message received", JSONdata);

    const code = JSONdata.code;
    const testCode = JSONdata.testCode;
    const submissionId = JSONdata.submissionId;

    // grading
    const result = await grade(code, testCode);
    console.log("result", result)

    try{
      await programmingAssignmentService.updateSubmission(result, submissionId);
    }catch(e){
      console.log(e);
      console.log("update result failed")
    }
    
    
    await channel.ack({ deliveryTag: args.deliveryTag });
  },
);
