import bcrypt from 'bcryptjs';
import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const result = await sql`INSERT INTO users (username, password_hash) VALUES (${username}, ${hashedPassword}) RETURNING *`;
      const user = result.rows[0];
      return res.status(201).json({ message: 'User registered successfully', user });
    } catch (error) {
      return res.status(500).json({ message: 'Error registering user', error });
    }
  } else {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
}
