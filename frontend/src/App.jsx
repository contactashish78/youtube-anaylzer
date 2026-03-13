import { useState } from 'react';
import './App.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8787';

function App() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setResult('');

    if (!url.trim()) {
      setError('Please paste a YouTube URL.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/transcript`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      setResult(data.markdown || 'No transcript generated.');
    } catch (err) {
      setError(err.message || 'Unable to fetch transcript.');
    } finally {
      setLoading(false);
    }
  };

  const copyMarkdown = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
  };

  return (
    <main className="container">
      <h1>YouTube Anaylzer</h1>
      <p>Paste a YouTube URL and get a markdown transcript with timestamps, chapters, and basic speaker turns.</p>

      <form onSubmit={submit} className="panel">
        <textarea
          rows={3}
          placeholder="https://www.youtube.com/watch?v=..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button type="submit" disabled={loading}>{loading ? 'Fetching…' : 'Get Transcript'}</button>
      </form>

      {error && <p className="error">{error}</p>}

      <section className="panel result">
        <div className="result-header">
          <h2>Markdown Transcript</h2>
          <button onClick={copyMarkdown} disabled={!result}>Copy Markdown</button>
        </div>
        <pre>{result || 'Transcript output will appear here.'}</pre>
      </section>
    </main>
  );
}

export default App;
