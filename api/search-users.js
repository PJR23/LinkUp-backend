import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const { query } = req.query;

    try {
      const { rows } = await sql`
        SELECT id, username 
        FROM users 
        WHERE username ILIKE ${'%' + query + '%'};
      `;
      return res.status(200).json(rows);
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching users', error });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
