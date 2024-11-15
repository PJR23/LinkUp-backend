import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const { chat_id } = req.query;

    if (!chat_id) {
      return res.status(400).json({ message: 'Chat ID is required' });
    }

    try {
      const { rows } = await sql`
        SELECT m.message, m.timestamp, u.username 
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.chat_id = ${chat_id}
        ORDER BY m.timestamp ASC;
      `;

      return res.status(200).json(rows);
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching messages', error });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}