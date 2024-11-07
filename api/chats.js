export default async function handler(req, res) {
    const users = [
      {
        id: 1,
        name: 'Max',
        chats: [
          { id: 1, title: 'Chat mit Anna', lastMessage: 'Wann treffen wir uns?' },
          { id: 2, title: 'Chat mit Oliver', lastMessage: 'Hab das Dokument bekommen!' }
        ]
      },
      {
        id: 2,
        name: 'Anna',
        chats: [
          { id: 1, title: 'Chat mit Max', lastMessage: 'Wann treffen wir uns?' }
        ]
      },
      {
        id: 3,
        name: 'Oliver',
        chats: [
          { id: 2, title: 'Chat mit Max', lastMessage: 'Hab das Dokument bekommen!' }
        ]
      }
    ];
  
    const currentUserId = 1;
    const currentUser = users.find(user => user.id === currentUserId);
  
    if (!currentUser) {
      return res.status(404).json({ error: 'Benutzer nicht gefunden' });
    }
  
    res.status(200).json(currentUser.chats);
  }
  