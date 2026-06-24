import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import constants from '../content/constants.json';
import useReducedMotion from '../hooks/useReducedMotion';
import { parseNarrative } from '../utils/narrativeParser';

interface NarrativeBoxProps {
  text: string;
  children?: ({ complete }: { complete: boolean }) => ReactNode;
  onComplete?: () => void;
}

export default function NarrativeBox({ text, children, onComplete }: NarrativeBoxProps) {
  const reducedMotion = useReducedMotion();
  const segments = useMemo(() => parseNarrative(text), [text]);
  const plainText = useMemo(() => segments.map((s) => s.text).join(''), [segments]);
  const totalLength = useMemo(
    () => segments.reduce((sum, s) => sum + s.text.length, 0),
    [segments]
  );
  const [visible, setVisible] = useState(0);
  const [complete, setComplete] = useState(false);
  const completedRef = useRef(false);

  useEffect(() => {
    setVisible(0);
    setComplete(false);
    completedRef.current = false;
  }, [text]);

  useEffect(() => {
    if (reducedMotion) {
      setVisible(totalLength);
      setComplete(true);
      if (!completedRef.current) {
        completedRef.current = true;
        onComplete?.();
      }
      return;
    }

    if (visible >= totalLength) {
      setComplete(true);
      if (!completedRef.current) {
        completedRef.current = true;
        onComplete?.();
      }
      return;
    }

    const { charDelayMs, punctuationPauseMs } = constants.typewriter;
    const currentChar = plainText[visible] ?? '';
    const isPunctuation = /[。！？，、；：!?,;:.]/.test(currentChar);
    const delay = isPunctuation ? punctuationPauseMs : charDelayMs;

    const timer = setTimeout(() => {
      setVisible((v) => Math.min(v + 1, totalLength));
    }, delay);

    return () => clearTimeout(timer);
  }, [visible, totalLength, text, reducedMotion, onComplete]);

  return (
    <section
      className="bg-surface border-2 border-foreground rounded-xl p-5 shadow-card"
      aria-live="polite"
      aria-label="叙事文本"
    >
      <p className="text-body text-foreground leading-[1.7]">
        {segments.map((segment, index) => {
          const segmentVisible = Math.max(0, visible - segment.start);
          const shown = segment.text.slice(0, segmentVisible);
          if (!shown) return null;

          const key = `${segment.type}-${index}`;
          switch (segment.type) {
            case 'inner':
              return (
                <em key={key} className="italic text-muted">
                  {shown}
                </em>
              );
            case 'social':
              return (
                <span key={key} className="font-bold bg-[#FDF4F8] px-2 py-0.5 rounded inline-block">
                  {shown}
                </span>
              );
            case 'meme':
              return (
                <span
                  key={key}
                  className="font-mono text-on-primary bg-primary px-2 py-0.5 rounded rotate-[-1deg] inline-block text-label"
                >
                  {shown}
                </span>
              );
            default:
              return <span key={key}>{shown}</span>;
          }
        })}
      </p>

      {children && children({ complete })}
    </section>
  );
}
