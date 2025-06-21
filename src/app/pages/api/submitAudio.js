

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const response = await fetch('https://easyessays.com.my/imaginehack/app.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        audioPath: '/var/www/html/imaginehack/frontend/test.wav'
      })
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      return res.status(500).json({ error: data.error || 'Server error' });
    }

    return res.status(200).json({
      video: data.responsePaths?.video || 'N/A',
      audio: data.responsePaths?.audio || 'N/A'
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Unexpected error' });
  }
}
