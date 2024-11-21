import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: Abrufen von Freunden oder Anfragen
  if (req.method === 'GET') {
    const { user_id, type } = req.query;

    if (!user_id) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    try {
      let rows;

      if (type === 'friends') {
        rows = await sql`
          SELECT f.friend_id AS id, u.username 
          FROM friends f
          JOIN users u ON f.friend_id = u.id
          WHERE f.user_id = ${user_id};
        `;
      } else if (type === 'received') {
        rows = await sql`
          SELECT fr.id, u.username, fr.status
          FROM friend_requests fr
          JOIN users u ON fr.from_user_id = u.id
          WHERE fr.to_user_id = ${user_id} AND fr.status = 'pending';
        `;
      } else if (type === 'pending') {
        rows = await sql`
          SELECT fr.id, u.username, fr.status
          FROM friend_requests fr
          JOIN users u ON fr.to_user_id = u.id
          WHERE fr.from_user_id = ${user_id} AND fr.status = 'pending';
        `;
      } else {
        return res.status(400).json({ message: 'Invalid type parameter' });
      }

      return res.status(200).json({ rows });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error fetching data', error });
    }
  }

  // POST: Freundschaftsanfrage senden
  if (req.method === 'POST' && req.query.action === 'send') {
    const { from_user_id, to_user_id } = req.body;

    if (!from_user_id || !to_user_id) {
      return res.status(400).json({ message: 'Both user IDs are required' });
    }

    try {
      await sql`
        INSERT INTO friend_requests (from_user_id, to_user_id) 
        VALUES (${from_user_id}, ${to_user_id});
      `;
      return res.status(200).json({ message: 'Friend request sent' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error sending request', error });
    }
  }
// POST: Freundschaftsanfrage ablehnen (reject)
  if (req.method === 'POST' && req.query.action === 'reject') {
    const { requestId } = req.body;

    if (!requestId) {
      return res.status(400).json({ message: 'Request ID is required' });
    }

    try {
      const { rows } = await sql`
        SELECT id
        FROM friend_requests
        WHERE id = ${requestId} AND status = 'pending';
      `;

      if (rows.length === 0) {
        return res.status(404).json({ message: 'Friend request not found or already processed' });
      }

      await sql`
        UPDATE friend_requests
        SET status = 'rejected'
        WHERE id = ${requestId};
      `;

      return res.status(200).json({ message: 'Friend request rejected' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error rejecting friend request', error });
    }
  }

  // POST: Freund entfernen (remove)
  if (req.method === 'POST' && req.query.action === 'remove') {
    const { userId, friendId } = req.body;

    if (!userId || !friendId) {
      return res.status(400).json({ message: 'Both user ID and friend ID are required' });
    }

    try {
      // Entfernen der Freundschaft
      await sql`
        DELETE FROM friends
        WHERE (user_id = ${userId} AND friend_id = ${friendId}) 
          OR (user_id = ${friendId} AND friend_id = ${userId});
      `;

      return res.status(200).json({ message: 'Friend removed successfully' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error removing friend', error });
    }
  }

  // POST: Freundschaftsanfrage akzeptieren
  if (req.method === 'POST' && req.query.action === 'accept') {
    const { requestId } = req.body;

    if (!requestId) {
      return res.status(400).json({ message: 'Request ID is required' });
    }

    try {
      const { rows } = await sql`
        SELECT from_user_id AS senderid, to_user_id AS receiverid
        FROM friend_requests
        WHERE id = ${requestId} AND status = 'pending';
      `;

      if (rows.length === 0) {
        return res.status(404).json({ message: 'Friend request not found or already processed' });
      }

      const { senderid, receiverid } = rows[0];

      if (!senderid || !receiverid) {
        return res.status(400).json({ message: 'Invalid friend request data' });
      }

      await sql`
        UPDATE friend_requests
        SET status = 'accepted'
        WHERE id = ${requestId};
      `;

      await sql`
        INSERT INTO friends (user_id, friend_id)
        VALUES (${senderid}, ${receiverid}), (${receiverid}, ${senderid});
      `;

      return res.status(200).json({ message: 'Friend request accepted and friendship established' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error processing friend request', error });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
