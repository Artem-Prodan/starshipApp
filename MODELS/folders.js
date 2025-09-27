// folder.js

import { pool } from "../db.js";

export const createFolder = async (name, userId) => {
  const result = await pool.query(
    `INSERT INTO folders (name, user_id) VALUES ($1, $2) RETURNING *`,
    [name, userId]
  );
  return result.rows[0];
};

export const getUserFolders = async (userId) => {
  const result = await pool.query(
    `SELECT * FROM folders WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
};

export const getNotesInFolder = async (folderId, userId) => {
  const result = await pool.query(
    `SELECT * FROM notes WHERE folder_id = $1 AND user_id = $2 ORDER BY created_at DESC`,
    [folderId, userId]
  );
  return result.rows;
};
