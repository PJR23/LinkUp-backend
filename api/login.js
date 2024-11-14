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

    try {
      const { rows } = await sql`SELECT * FROM users WHERE username = ${username};`;

      if (rows.length > 0) {
        const user = rows[0];
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (isValidPassword) {
          return res.status(200).json({ message: 'Login successful' });
        } else {
          return res.status(401).json({ message: 'Invalid credentials' });
        }
      } else {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    } catch (error) {
      return res.status(500).json({ message: 'Error logging in', error });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
