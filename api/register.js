import bcrypt from "bcryptjs";
import { sql } from "@vercel/postgres";

const allowCors = (fn) => async (req, res) => {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "OPTIONS,POST");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  return await fn(req, res);
};

const handler = async (req, res) => {
  if (req.method === "POST") {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username und Passwort sind erforderlich" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const { rows } = await sql`
        INSERT INTO users (username, password_hash)
        VALUES (${username}, ${hashedPassword})
        RETURNING id, username;
      `;
      const user = rows[0];

      res.status(201).json({ message: "Benutzer erfolgreich registriert", userId: user.id });
    } catch (error) {
      console.error("Datenbankfehler:", error);
      res.status(500).json({ message: "Fehler bei der Registrierung", error });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
};

module.exports = allowCors(handler);
