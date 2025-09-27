// db.js
import pkg from 'pg';
const { Pool } = pkg;

export const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Movie_DB',
  password: 'sqlDBpass',
  port: 5432,
});

// tables creation
const createTables = async () => {
  try {
    // USERS
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        nickname VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        passwordhash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // FOLDERS
    await pool.query(`
      CREATE TABLE IF NOT EXISTS folders (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // NOTES
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        imageurl TEXT,
        genre TEXT,
        director TEXT,
        releaseyear TEXT,
        giverating FLOAT CHECK (giverating BETWEEN 0 AND 5),
        comment TEXT,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // add new columns if not exist
    await pool.query(`ALTER TABLE notes ADD COLUMN IF NOT EXISTS isfavorite BOOLEAN DEFAULT FALSE;`);
    await pool.query(`ALTER TABLE notes ADD COLUMN IF NOT EXISTS iswatchlisted BOOLEAN DEFAULT FALSE;`);
    await pool.query(`ALTER TABLE notes ADD COLUMN IF NOT EXISTS folder_id INTEGER;`);

    // foreign key
     await pool.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_name = 'notes_folder_id_fkey'
        ) THEN
          ALTER TABLE notes DROP CONSTRAINT notes_folder_id_fkey;
        END IF;
      END$$;
    `);
    
    await pool.query(`
      ALTER TABLE notes
      ADD CONSTRAINT notes_folder_id_fkey
      FOREIGN KEY (folder_id)
      REFERENCES folders(id) ON DELETE CASCADE;
    `);

    console.log("✅ Tables created and updated with CASCADE.");
  } catch (err) {
    console.error("❌ Table setup error:", err);
  }
};

createTables();