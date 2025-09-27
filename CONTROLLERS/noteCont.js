import { pool } from "../db.js";

export const getAll = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT notes.*, users.nickname AS username
      FROM notes
      JOIN users ON notes.user_id = users.id
      WHERE notes.user_id = $1
      ORDER BY notes.created_at DESC
    `, [req.userId]);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Retrieving notes failed" });
  }
};


export const getOne = async (req, res) => {
  try {
    const noteId = req.params.mynote;

    const result = await pool.query(
      `SELECT * FROM notes WHERE id = $1`,
      [noteId]
    );

    const note = result.rows[0];

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Retrieving note failed" });
  }
};

export const remove = async (req, res) => {
  try {
    const noteId = req.params.mynote;

    const result = await pool.query(
      `DELETE FROM notes WHERE id = $1 RETURNING id`,
      [noteId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Note deletion failed" });
  }
};



export const create = async (req, res) => {
  try {
    const {
      title,
      imageUrl,
      genre,
      director,
      releaseYear,
      giveRating,
      comment,
      folderId,
    } = req.body;

    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized. No user ID found." });
    }

    const finalTitle = title?.trim() || "untitled";

    console.log("Incoming note creation data:", {
      title: finalTitle,
      imageUrl,
      genre,
      director,
      releaseYear,
      giveRating,
      comment,
      folderId,
      userId: req.userId
    });

    const result = await pool.query(
      `INSERT INTO notes (
        title, imageurl, genre, director, releaseyear,
        giverating, comment, folder_id, user_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        finalTitle,
        imageUrl ?? null,
        genre ?? null,
        director ?? null,
        releaseYear ?? null,
        giveRating ?? null,
        comment ?? "",
        folderId ?? null,
        req.userId
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Create note error:", err);
    res.status(500).json({ message: "Note creation failed" });
  }
};



export const update = async (req, res) => {
  try {
    const noteId = req.params.mynote;

    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized. No user ID found." });
    }

    const {
      title,
      imageUrl,
      genre,
      director,
      releaseYear,
      giveRating,
      comment,
      folderId,
      isFavorite,
      isWatchlisted,
    } = req.body;

    console.log("Incoming update data:", req.body);

    const currentNoteResult = await pool.query(
      "SELECT * FROM notes WHERE id = $1 AND user_id = $2",
      [noteId, req.userId]
    );

    if (currentNoteResult.rowCount === 0) {
      return res.status(404).json({ message: "Note not found or unauthorized" });
    }

    const currentNote = currentNoteResult.rows[0];

    const cleanIsFavorite =
      typeof isFavorite === "boolean" ? isFavorite : currentNote.isfavorite;

    const cleanIsWatchlisted =
      typeof isWatchlisted === "boolean" ? isWatchlisted : currentNote.iswatchlisted;

    // folderId: only update if explicitly provided
    let cleanFolderId = currentNote.folder_id;
    const hasFolderId = Object.prototype.hasOwnProperty.call(req.body, "folderId");

    if (hasFolderId) {
      if (folderId === null) {
        cleanFolderId = null;
      } else {
        const parsed = Number(folderId);
        cleanFolderId = isNaN(parsed) ? null : parsed;
      }
    }

    const result = await pool.query(
      `UPDATE notes SET
        title = COALESCE($1, title),
        imageurl = COALESCE($2, imageurl),
        genre = COALESCE($3, genre),
        director = COALESCE($4, director),
        releaseyear = COALESCE($5, releaseyear),
        giverating = COALESCE($6, giverating),
        comment = COALESCE($7, comment),
        folder_id = $8,
        isfavorite = COALESCE($9, isfavorite),
        iswatchlisted = COALESCE($10, iswatchlisted)
       WHERE id = $11 AND user_id = $12
       RETURNING *`,
      [
        title !== undefined ? title : currentNote.title,
        imageUrl !== undefined ? imageUrl : currentNote.imageurl,
        genre !== undefined ? genre : currentNote.genre,
        director !== undefined ? director : currentNote.director,
        releaseYear !== undefined ? releaseYear : currentNote.releaseyear,
        giveRating !== undefined ? giveRating : currentNote.giverating,
        comment !== undefined ? comment : currentNote.comment,
        cleanFolderId,
        cleanIsFavorite,
        cleanIsWatchlisted,
        noteId,
        req.userId,
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Update error:", err);
    res.status(400).json({ message: "Failed to update note", error: err.message });
  }
};





export const getFavorites = async (req, res) => {
  const result = await pool.query(
    `SELECT * FROM notes WHERE user_id = $1 AND isfavorite = true ORDER BY created_at DESC`,
    [req.userId]
  );
  res.json(result.rows);
};

export const getWatchlist = async (req, res) => {
  const result = await pool.query(
    `SELECT * FROM notes WHERE user_id = $1 AND iswatchlisted = true ORDER BY created_at DESC`,
    [req.userId]
  );
  res.json(result.rows);
};
