import { useEffect } from 'react';
import { useGameStore } from '../engine/useGameStore';
import type { AttributeKey } from '../types';
import { getEndingById } from '../utils/endings';

const ATTRIBUTE_ICONS: Record<AttributeKey, string> = {
  money: '💰',
  energy: '⚡',
  skill: '📚',
  connections: '🤝',
  mentalHealth: '😊',
};

const MILESTONE_LABELS: Record<string, string> = {
  undergrad_start: '站在大四路口',
  exam_intro: '选择考研',
  job_intro: '选择找工作',
  civil_intro: '选择考公',
  lie_intro: '选择躺平',
  exam_pass: '考研上岸',
  postgrad_start: '开始读研',
  job_offer: '拿到第一份工作',
  civil_pass: '考公上岸',
  lie_freelance: '自由职业',
  lie_full_flat: '彻底躺平',
};

interface LifeResumeProps {
  onRenderComplete?: () => void;
}

export default function LifeResume({ onRenderComplete }: LifeResumeProps) {
  const attributes = useGameStore((s) => s.attributes);
  const history = useGameStore((s) => s.eventHistory);
  const endingId = useGameStore((s) => s.endingId);
  const ending = endingId ? getEndingById(endingId) : undefined;

  useEffect(() => {
    const timer = setTimeout(() => onRenderComplete?.(), 800);
    return () => clearTimeout(timer);
  }, [onRenderComplete]);

  const milestones = history
    .map((log) => MILESTONE_LABELS[log.eventId])
    .filter(Boolean)
    .slice(0, 5);

  const today = new Date().toLocaleDateString('zh-CN');

  return (
    <div
      id="life-resume-poster"
      className="relative w-full aspect-[9/16] bg-background p-6 flex flex-col gap-5 overflow-hidden"
    >
      {/* Memphis decorations */}
      <div className="absolute top-8 right-6 w-12 h-12 rounded-full bg-sticker-pink/10 rotate-12" />
      <div className="absolute bottom-24 left-4 w-16 h-4 bg-tape/40 rotate-[-6deg]" />
      <div className="absolute top-1/3 left-2 w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-b-[28px] border-b-sticker-teal/10 rotate-12" />

      <header className="relative z-10">
        <h2 className="text-title text-foreground">人生简历</h2>
        <p className="text-caption text-muted">生成于 {today}</p>
      </header>

      <section className="relative z-10 space-y-2">
        <h3 className="text-label font-bold text-foreground">关键选择</h3>
        {milestones.length === 0 ? (
          <p className="text-body text-muted">一切才刚刚开始。</p>
        ) : (
          <ul className="space-y-2">
            {milestones.map((label, index) => (
              <li key={index} className="flex items-center gap-2 text-body text-foreground">
                <span className="h-1.5 w-6 bg-tape rotate-[-2deg]" />
                {label}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="relative z-10 space-y-2">
        <h3 className="text-label font-bold text-foreground">最终属性</h3>
        <div className="grid grid-cols-1 gap-2">
          {(Object.keys(attributes) as AttributeKey[]).map((key) => (
            <div key={key} className="flex items-center gap-2">
              <span className="text-body">{ATTRIBUTE_ICONS[key]}</span>
              <div className="flex-1 h-2 bg-border rounded-sm overflow-hidden">
                <div
                  className={`h-full rounded-sm ${
                    key === 'mentalHealth' && attributes[key] <= 30
                      ? 'bg-destructive'
                      : 'bg-primary'
                  }`}
                  style={{ width: `${attributes[key]}%` }}
                />
              </div>
              <span className="text-caption font-mono w-8 text-right">{attributes[key]}</span>
            </div>
          ))}
        </div>
      </section>

      {ending && (
        <section className="relative z-10 mt-auto">
          <div className="inline-block bg-surface border-2 border-foreground px-4 py-3 rounded-xl shadow-card rotate-[-2deg]">
            <p className="text-caption text-muted uppercase tracking-wide">
              {ending.rarity === 'hidden'
                ? '隐藏结局'
                : ending.rarity === 'route'
                  ? '路线结局'
                  : '普通结局'}
            </p>
            <h3 className="text-hero text-foreground mt-1">{ending.title}</h3>
          </div>
        </section>
      )}

      <footer className="relative z-10 pt-2">
        <p className="text-caption text-muted text-center">
          CowHorse 社畜模拟器 · cowhorse.pages.dev
        </p>
      </footer>
    </div>
  );
}
