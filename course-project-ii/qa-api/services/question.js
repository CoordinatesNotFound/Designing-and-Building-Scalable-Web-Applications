import { sql } from "../database/database.js";

const findByCourseId = async (course_id) => {
  return await sql`SELECT * FROM questions WHERE course_id = ${course_id};`;
};

const addQuestion = async (content, course_id, votes, user_uuid) => {
  const res =
    await sql`INSERT INTO questions (content, course_id, votes, created_by) VALUES (${content}, ${course_id}, ${votes}, ${user_uuid}) RETURNING *`;
  if (res && res.length > 0){
      return res[0];
  }
  return null;
};

const updateVotes = async (id, user_uuid) => {
  const res =
    await sql`UPDATE questions SET votes=votes+1, last_updated = NOW() WHERE id = ${id}`;
  await sql`INSERT INTO question_votes (question_id, user_uuid) VALUES (${id}, ${user_uuid})`;
  return res;
};

const findVote = async (question_id, user_uuid) => {
  const res = await sql`SELECT * FROM question_votes WHERE question_id=${question_id} AND user_uuid = ${user_uuid}`;
  if(res && res.length > 0) {
    return true;
  }
  return false;
}

const findById = async(id) => {
  const res = await sql`SELECT * FROM questions WHERE id = ${id}`;
  if (res && res.length > 0){
    return res[0];
  }
  return null;
}

const findLastCreatedByUser = async(user_uuid) => {
  const res = await sql`SELECT created_at FROM questions WHERE created_by = ${user_uuid} ORDER BY created_at DESC LIMIT 1;`
  if (res && res.length > 0){
    return res[0].created_at;
  }
  return null;
}

export { addQuestion, findByCourseId, updateVotes, findVote, findById, findLastCreatedByUser };
