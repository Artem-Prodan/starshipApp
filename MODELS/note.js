//note.js

import { pool } from "../db.js";

export const getAllNotes = async (userId) => {
  const result = await pool.query(
    `SELECT notes.*, users.nickname AS username
     FROM notes
     JOIN users ON notes.user_id = users.id
     WHERE user_id = $1
     ORDER BY notes.created_at DESC`,
    [userId]
  );
  return result.rows;
};


export const getNoteById = async (id) => {
  const result = await pool.query(
    "SELECT * FROM notes WHERE id = $1",
    [id]
  );
  return result.rows[0];
};

export const deleteNoteById = async (id) => {
  const result = await pool.query(
    "DELETE FROM notes WHERE id = $1 RETURNING id",
    [id]
  );
  return result.rowCount > 0;
};

export const createNote = async ({
  title,
  imageUrl,
  genre,
  director,
  releaseYear,
  giveRating,
  comment,
  isFavorite = false,
  isWatchlisted = false,
  folderId = null,
  userId,
}) => {
  const result = await pool.query(
    `INSERT INTO notes (
      title, imageurl, genre, director, releaseyear,
      giverating, comment, isfavorite, iswatchlisted, folder_id, user_id
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *`,
    [
      title,
      imageUrl,
      genre,
      director,
      releaseYear,
      giveRating,
      comment,
      isFavorite,
      isWatchlisted,
      folderId,
      userId,
    ]
  );
  return result.rows[0];
};


export const updateNote = async (id, noteData) => {
  const {
    title,
    imageUrl,
    genre,
    director,
    releaseYear,
    giveRating,
    comment,
    isFavorite,
    isWatchlisted,
    folderId
  } = noteData;

  const result = await pool.query(
    `UPDATE notes SET
      title = $1,
      imageurl = $2,
      genre = $3,
      director = $4,
      releaseyear = $5,
      giverating = $6,
      comment = $7,
      isfavorite = $8,
      iswatchlisted = $9,
      folder_id = $10
     WHERE id = $11
     RETURNING *`,
    [
      title,
      imageUrl,
      genre,
      director,
      releaseYear,
      giveRating,
      comment,
      isFavorite,
      isWatchlisted,
      folderId,
      id
    ]
  );

  return result.rows[0];
};
