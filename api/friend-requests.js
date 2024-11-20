export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
  
    if (req.method === 'GET') {
      const { user_id } = req.query;
      if (!user_id) {
        return res.status(400).json({ message: 'User ID is required' });
      }
  
      try {
        const { rows } = await sql`
          SELECT fr.id, u.username 
          FROM friend_requests fr
          JOIN users u ON fr.to_user_id = u.id
          WHERE fr.from_user_id = ${user_id} AND fr.status = 'pending';
        `;
  
        return res.status(200).json(rows);
      } catch (error) {
        return res.status(500).json({ message: 'Error fetching pending requests', error });
      }
    } else {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  }