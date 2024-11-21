import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const { requestId } = req.body;

    if (!requestId) {
      return res.status(400).json({ message: 'Request ID is required' });
    }

    try {
      // Ermitteln der senderId und receiverId basierend auf der Anfrage-ID
      const { rows } = await sql`
        SELECT from_user_id AS senderId, to_user_id AS receiverId
        FROM friend_requests
        WHERE id = ${requestId} AND status = 'pending'
      `;

      if (rows.length === 0) {
        return res.status(404).json({ message: 'Friend request not found or already processed' });
      }

      const { senderId, receiverId } = rows[0];

      // Anfrage als akzeptiert markieren
      await sql`
        UPDATE friend_requests
        SET status = 'accepted'
        WHERE id = ${requestId}
      `;

      // Freundschaft in die friends-Tabelle eintragen
      await sql`
        INSERT INTO friends (user_id_1, user_id_2)
        VALUES (${senderId}, ${receiverId}), (${receiverId}, ${senderId})
      `;

      return res.status(200).json({ message: 'Friend request accepted and friendship established' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error processing friend request', error });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
