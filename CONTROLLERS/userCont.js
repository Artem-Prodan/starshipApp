import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { pool } from "../db.js";

export const register = async (req, res) => {
  try {
    const { email, nickName, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const result = await pool.query(
      `INSERT INTO users (nickname, email, passwordhash)
       VALUES ($1, $2, $3)
       RETURNING id, nickname, email`,
      [nickName, email, hash]
    );

    const user = result.rows[0];

    const token = jwt.sign({ id: user.id }, "secret444", { expiresIn: "20d" });

    res.json({ ...user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Registration failed" });
  }
};

export const login = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [req.body.email]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isValidPass = await bcrypt.compare(
      req.body.password,
      user.passwordhash
    );

    if (!isValidPass) {
      return res.status(401).json({ message: "Wrong login or password" });
    }

    const token = jwt.sign({ id: user.id }, "secret444", { expiresIn: "20d" });

    const { passwordhash, ...userData } = user;

    res.json({ ...userData, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Authorization failed" });
  }
};

export const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, nickname, email FROM users WHERE id = $1`,
      [req.userId]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get user" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const userId = req.userId;
    const { nickName, email, password } = req.body;

    let hash = null;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      hash = await bcrypt.hash(password, salt);
    }

    const result = await pool.query(
      `
      UPDATE users SET
        nickname = COALESCE($1, nickname),
        email = COALESCE($2, email),
        passwordhash = COALESCE($3, passwordhash)
      WHERE id = $4
      RETURNING id, nickname, email
      `,
      [nickName || null, email || null, hash || null, userId]
    );

    const updatedUser = result.rows[0];

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update user" });
  }
};
