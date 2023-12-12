import { sql } from "../database/database.js";

const findAll = async () => {
  return await sql`SELECT * FROM courses;`;
};

export { findAll }