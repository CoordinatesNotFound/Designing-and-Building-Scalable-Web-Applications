import { sql } from "../database/database.js";

const findByQuestionId = async (question_id) => {
  return await sql`SELECT * FROM answers WHERE question_id = ${question_id};`;
};

const addAnswer = async (content, question_id, votes, user_uuid) => {
  const res =
    await sql`INSERT INTO answers (content, question_id, votes, created_by) VALUES (${content}, ${question_id}, ${votes}, ${user_uuid}) RETURNING *`;
  if (res && res.length > 0){
      return res[0];
  }
  return null;
};

const findVote = async (answer_id, user_uuid) => {
  const res = await sql`SELECT * FROM answer_votes WHERE answer_id=${answer_id} AND user_uuid = ${user_uuid}`;
  if(res && res.length > 0) {
    return true;
  }
  return false;
}

const updateVotes = async (id, user_uuid) => {
  const res =
    await sql`UPDATE answers SET votes=votes+1, last_updated = NOW() WHERE id = ${id}`;
  await sql`INSERT INTO answer_votes (answer_id, user_uuid) VALUES (${id}, ${user_uuid})`;
  return res;
};

const findLastCreatedByUser = async(user_uuid) => {
  const res = await sql`SELECT created_at FROM answers WHERE created_by = ${user_uuid} ORDER BY created_at DESC LIMIT 1;`
  if (res && res.length > 0){
    return res[0].created_at;
  }
  return null;
}

export { addAnswer, findByQuestionId, findVote, updateVotes, findLastCreatedByUser };
