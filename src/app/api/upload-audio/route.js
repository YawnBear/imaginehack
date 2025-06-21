import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request) {
  try {
    const arrayBuffer = await request.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const recordingsDir = path.join(process.cwd(), 'server', 'audio');

    // Ensure the folder exists
    await mkdir(recordingsDir, { recursive: true });

    const filePath = path.join(recordingsDir, `audio_${Date.now()}.webm`);
    await writeFile(filePath, buffer);

    return Response.json({ message: 'Audio uploaded successfully', path: filePath });
  } catch (err) {
    console.error('❌ Upload failed:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
