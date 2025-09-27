//user.js
import { pool } from "../db.js";

export const createUser = async (nickName, email, passwordHash) => {
  const result = await pool.query(
    "INSERT INTO users (nickname, email, passwordhash) VALUES ($1, $2, $3) RETURNING id, nickname, email",
    [nickName, email, passwordHash]
  );
  return result.rows[0];
};

export const findUserByEmail = async (email) => {
  const result = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );
  return result.rows[0];
};

export const findUserById = async (id) => {
  const result = await pool.query(
    "SELECT id, nickname, email FROM users WHERE id = $1",
    [id]
  );
  return result.rows[0];
};
