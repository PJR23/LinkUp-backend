import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

export default async function handler(req, res) {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM chats WHERE user_ids @> ARRAY[$1]::INTEGER[]',
      [userId]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user chats', error });
  }
}
