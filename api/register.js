import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const result = await pool.query(
        'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
        [username, email, hashedPassword]
      );
      const user = result.rows[0];
      const token = jwt.sign({ userId: user.id }, 'your_jwt_secret', { expiresIn: '1h' });

      return res.status(201).json({ message: 'User registered successfully', token });
    } catch (error) {
      return res.status(500).json({ message: 'Error registering user', error });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
