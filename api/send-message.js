import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // CORS-Header hinzufügen
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  // OPTIONS-Anfrage für CORS-Preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // POST-Anfrage zum Senden von Nachrichten
  if (req.method === 'POST') {
    const { chat_id, message, user_id } = req.body;

    // Überprüfen, ob alle erforderlichen Felder vorhanden sind
    if (!chat_id || !message || !user_id) {
      return res.status(400).json({ error: 'Fehlende Parameter' });
    }

    try {
      // SQL-Abfrage zum Hinzufügen einer Nachricht in die Datenbank
      const { rows } = await sql`
        INSERT INTO messages (chat_id, sender_id, message, timestamp)
        VALUES (${chat_id}, ${user_id}, ${message}, NOW())
        RETURNING id, chat_id, sender_id, message, timestamp;
      `;

      // Rückgabe der neuen Nachricht als Bestätigung
      return res.status(200).json({ success: true, message: rows[0] });
    } catch (error) {
      console.error('Fehler beim Speichern der Nachricht:', error);
      return res.status(500).json({ error: 'Fehler beim Senden der Nachricht' });
    }
  } else {
    return res.status(405).json({ error: 'Methode nicht erlaubt' });
  }
}
