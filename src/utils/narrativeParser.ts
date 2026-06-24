export type VoiceType = 'default' | 'inner' | 'social' | 'meme';

export interface NarrativeSegment {
  type: VoiceType;
  text: string;
  start: number;
  end: number;
}

export function parseNarrative(text: string): NarrativeSegment[] {
  const segments: NarrativeSegment[] = [];
  let position = 0;
  let remaining = text;

  const patterns: { marker: string; end: string; type: VoiceType }[] = [
    { marker: '*', end: '*', type: 'inner' },
    { marker: '!', end: '!', type: 'social' },
    { marker: '[', end: ']', type: 'meme' },
  ];

  while (remaining.length > 0) {
    let matched = false;
    for (const { marker, end, type } of patterns) {
      if (remaining.startsWith(marker)) {
        const closeIndex = remaining.indexOf(end, marker.length);
        if (closeIndex > marker.length) {
          const content = remaining.slice(marker.length, closeIndex);
          segments.push({
            type,
            text: content,
            start: position,
            end: position + content.length,
          });
          position += content.length;
          remaining = remaining.slice(closeIndex + end.length);
          matched = true;
          break;
        }
      }
    }
    if (matched) continue;

    // Find the nearest marker start
    const nextMarker = Math.min(
      ...patterns.map((p) => remaining.indexOf(p.marker, 1)).filter((i) => i > 0)
    );
    const sliceEnd = Number.isFinite(nextMarker) ? nextMarker : remaining.length;
    const content = remaining.slice(0, sliceEnd);
    if (content) {
      segments.push({
        type: 'default',
        text: content,
        start: position,
        end: position + content.length,
      });
      position += content.length;
    }
    remaining = remaining.slice(sliceEnd);
  }

  return segments;
}
