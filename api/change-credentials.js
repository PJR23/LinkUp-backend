import { sql } from '@vercel/postgres';
import bcrypt from 'bcrypt';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST' && req.query.action === 'change-password') {
    const { userId, currentPassword, newPassword } = req.body;

    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    try {
      // Überprüfen des aktuellen Passworts
      const { rows } = await sql`
        SELECT password FROM users WHERE id = ${userId};
      `;

      if (rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, rows[0].password);

      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid current password' });
      }

      // Hashen des neuen Passworts
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Passwort aktualisieren
      await sql`
        UPDATE users
        SET password = ${hashedPassword}
        WHERE id = ${userId};
      `;

      return res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error updating password', error });
    }
  }

  if (req.method === 'POST' && req.query.action === 'change-username') {
    const { userId, currentPassword, newUsername } = req.body;

    if (!userId || !currentPassword || !newUsername) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    try {
      // Überprüfen des aktuellen Passworts
      const { rows } = await sql`
        SELECT password FROM users WHERE id = ${userId};
      `;

      if (rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, rows[0].password);

      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid current password' });
      }

      // Benutzername aktualisieren
      await sql`
        UPDATE users
        SET username = ${newUsername}
        WHERE id = ${userId};
      `;

      return res.status(200).json({ message: 'Username updated successfully' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error updating username', error });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
