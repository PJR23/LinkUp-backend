import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const { user_id } = req.query;

    try {
      const { rows } = await sql`
        SELECT u.id, u.username 
        FROM friends f
        JOIN users u ON f.friend_id = u.id
        WHERE f.user_id = ${user_id};
      `;
      return res.status(200).json(rows);
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching friends', error });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
