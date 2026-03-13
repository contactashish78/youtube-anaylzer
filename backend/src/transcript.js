import { YoutubeTranscript } from 'youtube-transcript';

const YOUTUBE_URL_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i;

export function validateYoutubeUrl(url) {
  if (!url || typeof url !== 'string') return 'URL is required';
  if (!YOUTUBE_URL_REGEX.test(url.trim())) return 'Please provide a valid YouTube URL';
  return null;
}

function toTimestamp(seconds) {
  const total = Math.max(0, Math.floor(seconds || 0));
  const hh = Math.floor(total / 3600);
  const mm = Math.floor((total % 3600) / 60);
  const ss = total % 60;

  if (hh > 0) return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

function buildTurns(items, pauseThreshold = 6) {
  const turns = [];
  let currentSpeaker = 1;

  for (let i = 0; i < items.length; i += 1) {
    const curr = items[i];
    const prev = items[i - 1];

    if (!prev) {
      turns.push({ ...curr, speaker: currentSpeaker });
      continue;
    }

    const prevEnd = (prev.offset / 1000) + prev.duration;
    const gap = (curr.offset / 1000) - prevEnd;

    if (gap > pauseThreshold) {
      currentSpeaker = currentSpeaker === 1 ? 2 : 1;
    }

    turns.push({ ...curr, speaker: currentSpeaker });
  }

  return turns;
}

function groupIntoChapters(turns, chapterSizeSec = 300) {
  const chapters = [];

  turns.forEach((line) => {
    const startSec = Math.floor(line.offset / 1000);
    const chapterIndex = Math.floor(startSec / chapterSizeSec);

    if (!chapters[chapterIndex]) {
      const chapterStart = chapterIndex * chapterSizeSec;
      chapters[chapterIndex] = {
        title: `Chapter ${chapterIndex + 1}`,
        startSec: chapterStart,
        start: toTimestamp(chapterStart),
        lines: []
      };
    }

    chapters[chapterIndex].lines.push({
      timestamp: toTimestamp(startSec),
      speaker: `Speaker ${line.speaker}`,
      text: line.text.replace(/\s+/g, ' ').trim()
    });
  });

  return chapters.filter(Boolean);
}

function chaptersToMarkdown(chapters) {
  const out = ['# Transcript', ''];

  chapters.forEach((chapter) => {
    out.push(`## ${chapter.title} (${chapter.start})`);
    out.push('');

    chapter.lines.forEach((line) => {
      out.push(`- [${line.timestamp}] **${line.speaker}:** ${line.text}`);
    });

    out.push('');
  });

  return out.join('\n').trim();
}

export async function fetchTranscriptMarkdown(url) {
  const transcript = await YoutubeTranscript.fetchTranscript(url);

  if (!Array.isArray(transcript) || transcript.length === 0) {
    throw new Error('No transcript found for this video. It may not have captions enabled.');
  }

  const normalized = transcript
    .filter((line) => line?.text)
    .map((line) => ({
      text: line.text,
      duration: Number(line.duration) || 0,
      offset: Number(line.offset) || 0
    }));

  const turns = buildTurns(normalized);
  const chapters = groupIntoChapters(turns);
  const markdown = chaptersToMarkdown(chapters);

  return {
    markdown,
    chapters: chapters.map((c) => ({ title: c.title, start: c.start, lines: c.lines.length })),
    totalLines: normalized.length
  };
}
