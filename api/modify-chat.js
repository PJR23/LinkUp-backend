import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const { chat_id, type } = req.query;

    if (!chat_id) {
      return res.status(400).json({ message: 'Chat ID is required' });
    }

    try {
      let rows;

      if (type === 'members') {
        rows = await sql`
          SELECT cm.user_id, cm.role, u.username
          FROM chat_members cm
          JOIN users u ON cm.user_id = u.id
          WHERE cm.chat_id = ${chat_id};
        `;
      } else {
        return res.status(400).json({ message: 'Invalid type parameter' });
      }

      return res.status(200).json({ rows });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error fetching chat data', error });
    }
  }

  if (req.method === 'POST') {
    const { chat_id, user_id, action, target_user_id, role } = req.body;

    if (!chat_id || !action || !user_id) {
      return res.status(400).json({ message: 'Chat ID, user ID, and action are required' });
    }

    try {
      // Admin-Überprüfung
      const { rows: adminCheck } = await sql`
        SELECT role
        FROM chat_members
        WHERE chat_id = ${chat_id} AND user_id = ${user_id};
      `;

      if (adminCheck.length === 0 || adminCheck[0].role !== 'admin') {
        return res.status(403).json({ message: 'Only admins can perform this action' });
      }

      if (action === 'add') {
        if (!target_user_id) {
          return res.status(400).json({ message: 'Target user ID is required to add a user' });
        }
        await sql`
          INSERT INTO chat_members (chat_id, user_id, role)
          VALUES (${chat_id}, ${target_user_id}, 'member');
        `;
        return res.status(200).json({ message: 'User added to chat successfully' });
      }

      if (action === 'remove') {
        if (!target_user_id) {
          return res.status(400).json({ message: 'Target user ID is required to remove a user' });
        }
        await sql`
          DELETE FROM chat_members
          WHERE chat_id = ${chat_id} AND user_id = ${target_user_id};
        `;
        return res.status(200).json({ message: 'User removed from chat successfully' });
      }

      if (action === 'change_role') {
        if (!target_user_id || !role) {
          return res.status(400).json({ message: 'Target user ID and role are required to change role' });
        }
        await sql`
          UPDATE chat_members
          SET role = ${role}
          WHERE chat_id = ${chat_id} AND user_id = ${target_user_id};
        `;
        return res.status(200).json({ message: 'User role updated successfully' });
      }

      return res.status(400).json({ message: 'Invalid action specified' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error processing chat action', error });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
