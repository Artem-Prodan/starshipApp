import { createFolder, getUserFolders, getNotesInFolder } from "../MODELS/folders.js";
import { pool } from "../db.js";

export const create = async (req, res) => {
  try {
    const folder = await createFolder(req.body.name, req.userId);
    res.json(folder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create folder" });
  }
};

export const getAll = async (req, res) => {
  try {
    const folders = await getUserFolders(req.userId);
    res.json(folders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load folders" });
  }
};

export const getNotes = async (req, res) => {
  try {
    const folderId = req.params.id;
    const notes = await getNotesInFolder(folderId, req.userId);
    res.json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load notes from folder" });
  }
};

export const remove = async (req, res) => {
  const folderId = req.params.id;

  try {
    const result = await pool.query(
      `DELETE FROM folders WHERE id = $1 AND user_id = $2`,
      [folderId, req.userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Folder not found or not owned by user" });
    }

    res.json({ success: true });

  } catch (err) {
    console.error("Error deleting folder:", err.message);
    res.status(500).json({ message: "Failed to delete folder" });
  }
};



