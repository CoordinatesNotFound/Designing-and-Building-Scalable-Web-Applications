import { executeQuery } from "../database/database.js";

const updateSubmission = async (result, id) => {
  if (result[0] === ".") {
    await executeQuery(
      `UPDATE programming_assignment_submissions SET status='processed', correct=true, grader_feedback=$result WHERE id=$id`,
      { result, id },
    );
  } else {
    await executeQuery(
      `UPDATE programming_assignment_submissions SET status='processed', correct=false, grader_feedback=$result WHERE id=$id`,
      { result, id },
    );
  }

  return true;
};

export { updateSubmission };
