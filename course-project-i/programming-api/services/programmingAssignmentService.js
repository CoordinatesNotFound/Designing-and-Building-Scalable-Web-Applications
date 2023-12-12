import { sql } from "../database/database.js";


// find a submission with same assignment and code
const getSubmissionByAssignmentAndCode = async (programming_assignment_id, code) => {
  const exist = await sql`SELECT * FROM programming_assignment_submissions WHERE programming_assignment_id = ${programming_assignment_id} AND code = ${code}`

  // exist, return that submission's id
  if (exist.length > 0) {
    console.log(exist)
    return exist[0].id;
  }

  // not exist, return null
  return null;
};


// record a submission
const addSubmission = async (user_uuid, programming_assignment_id, code) => {

  const res = await sql`INSERT INTO programming_assignment_submissions (user_uuid, programming_assignment_id, code) VALUES (${user_uuid}, ${programming_assignment_id}, ${code}) RETURNING id`

  return res[0].id;
};


// get an assignment by id
const getAssignment = async (id) => {
  const res = await sql`SELECT * FROM programming_assignments WHERE id=${id};`
  return res[0];
};


const getSubmission = async (id) => {
  const res = await sql`SELECT * FROM programming_assignment_submissions WHERE id=${id};`;

  return res[0];
};


// const findAll = async () => {
//   return await sql`SELECT * FROM programming_assignments;`;
// };

export { addSubmission, getSubmissionByAssignmentAndCode, getAssignment, getSubmission };
