export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof Blob)) {
      return Response.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Build the outgoing multipart request
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).slice(2);
    const CRLF = '\r\n';
    const multipartBody =
      `--${boundary}${CRLF}` +
      `Content-Disposition: form-data; name="audio"; filename="audio.wav"${CRLF}` +
      `Content-Type: ${file.type || 'audio/wav'}${CRLF}${CRLF}` +
      buffer.toString('binary') + CRLF +
      `--${boundary}--${CRLF}`;

    const res = await fetch('https://easyessays.com.my/imaginehack/app.php', {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      body: Buffer.from(multipartBody, 'binary'),
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      return Response.json({ error: data.error || 'API error' }, { status: 500 });
    }

    return Response.json({
      video: data.responsePaths?.video || 'N/A',
      audio: data.responsePaths?.audio || 'N/A'
    });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
