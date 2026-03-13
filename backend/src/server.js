import express from 'express';
import cors from 'cors';
import { fetchTranscriptMarkdown, validateYoutubeUrl } from './transcript.js';

const app = express();
const port = process.env.PORT || 8787;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/transcript', async (req, res) => {
  const { url } = req.body || {};
  const validationError = validateYoutubeUrl(url);

  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const result = await fetchTranscriptMarkdown(url.trim());
    return res.json(result);
  } catch (error) {
    const message = error?.message || 'Unable to fetch transcript';
    return res.status(500).json({ error: message });
  }
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
