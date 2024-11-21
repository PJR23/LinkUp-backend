import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const { userId, friendIds, chatName } = req.body;

    if (!userId || !friendIds || !chatName || friendIds.length < 1) {
      return res.status(400).json({ message: 'User ID, Friend IDs, and Chat Name are required' });
    }

    try {
      // Chat erstellen
      const result = await sql`
        INSERT INTO chats (name) 
        VALUES (${chatName}) 
        RETURNING id;
      `;
      const chatId = result.rows[0].id;

      // Mitglieder einfügen
      const members = friendIds.map(id => {
        return sql`
          INSERT INTO chat_members (chat_id, user_id, role)
          VALUES (${chatId}, ${id}, 'member');
        `;
      });

      // Den Ersteller als Admin hinzufügen
      members.push(sql`
        INSERT INTO chat_members (chat_id, user_id, role)
        VALUES (${chatId}, ${userId}, 'admin');
      `);

      await Promise.all(members);

      return res.status(200).json({ message: 'Chat created successfully', chatId });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error creating chat', error });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
