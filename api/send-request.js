import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const { from_user_id, to_user_id } = req.body;

    try {
      await sql`
        INSERT INTO friend_requests (from_user_id, to_user_id) 
        VALUES (${from_user_id}, ${to_user_id});
      `;
      return res.status(200).json({ message: 'Friend request sent' });
    } catch (error) {
      return res.status(500).json({ message: 'Error sending request', error });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
