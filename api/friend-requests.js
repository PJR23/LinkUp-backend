import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const { user_id, type } = req.query;

    if (!user_id || !type) {
      return res.status(400).json({ message: 'User ID and type are required' });
    }

    try {
      let rows;

      if (type === 'received') {
        // Empfangene Freundschaftsanfragen
        rows = await sql`
          SELECT fr.id, u.username, fr.status 
          FROM friend_requests fr
          JOIN users u ON fr.from_user_id = u.id
          WHERE fr.to_user_id = ${user_id} AND fr.status = 'pending';
        `;
      } else if (type === 'pending') {
        // Ausgehende Freundschaftsanfragen
        rows = await sql`
          SELECT fr.id, u.username, fr.status 
          FROM friend_requests fr
          JOIN users u ON fr.to_user_id = u.id
          WHERE fr.from_user_id = ${user_id} AND fr.status = 'pending';
        `;
      } else {
        return res.status(400).json({ message: 'Invalid type parameter' });
      }

      return res.status(200).json(rows);
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching friend requests', error });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
