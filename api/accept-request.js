import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const { requestId, senderId, receiverId } = req.body;
    if (!requestId || !senderId || !receiverId) {
      return res.status(400).json({ message: 'Request ID, Sender ID, and Receiver ID are required' });
    }

    try {
      // Anfrage als akzeptiert markieren
      await sql`
        UPDATE friend_requests
        SET status = 'accepted'
        WHERE id = ${requestId}
      `;

      // Freundschaft in die friends Tabelle eintragen
      await sql`
        INSERT INTO friends (user_id_1, user_id_2)
        VALUES (${senderId}, ${receiverId}), (${receiverId}, ${senderId})
      `;

      return res.status(200).json({ message: 'Friend request accepted and friendship established' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error accepting request and establishing friendship', error });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}