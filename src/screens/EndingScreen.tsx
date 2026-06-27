import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LifeResume from '../components/LifeResume';
import { useGameStore } from '../engine/useGameStore';
import { getEndingById } from '../utils/endings';
import { downloadPoster, renderPoster, sharePoster } from '../utils/poster';

export default function EndingScreen() {
  const navigate = useNavigate();
  const endingId = useGameStore((s) => s.endingId);
  const resetGame = useGameStore((s) => s.resetGame);
  const ending = endingId ? getEndingById(endingId) : undefined;

  const [posterDataUrl, setPosterDataUrl] = useState<string | null>(null);
  const [posterError, setPosterError] = useState<string | null>(null);

  useEffect(() => {
    if (posterDataUrl || !endingId) return;
    renderPoster()
      .then((url) => {
        setPosterDataUrl(url);
        setPosterError(null);
      })
      .catch((err) => {
        setPosterError(err instanceof Error ? err.message : '海报生成失败');
      });
  }, [posterDataUrl, endingId]);

  const handleSave = useCallback(() => {
    if (posterDataUrl) downloadPoster(posterDataUrl);
  }, [posterDataUrl]);

  const handleShare = useCallback(async () => {
    if (!posterDataUrl) return;
    try {
      await sharePoster(posterDataUrl);
    } catch {
      // Fallback: copy data URL is not ideal; at least offer download.
      downloadPoster(posterDataUrl);
    }
  }, [posterDataUrl]);

  const handleReplay = useCallback(() => {
    resetGame();
    navigate('/');
  }, [navigate, resetGame]);

  if (!ending) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-title text-foreground">结局走丢了</h1>
        <button type="button" onClick={handleReplay} className="btn-primary mt-6">
          再玩一次
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-y-auto px-4 py-6">
      <header className="text-center mb-4">
        <h1 className="text-hero text-foreground">{ending.title}</h1>
        <span className="inline-block mt-2 bg-tape text-foreground text-caption font-bold px-3 py-1 rounded rotate-[2deg]">
          {ending.rarity === 'hidden'
            ? '隐藏结局'
            : ending.rarity === 'route'
              ? '路线结局'
              : '普通结局'}
        </span>
        <p className="text-body text-foreground mt-4 max-w-xs mx-auto">{ending.description}</p>
      </header>

      <div className="w-full max-w-xs mx-auto mb-4">
        <LifeResume onRenderComplete={() => {}} />
      </div>

      {posterError && (
        <p className="text-caption text-destructive text-center mb-3">{posterError}</p>
      )}

      <div className="flex items-center justify-center gap-3 mb-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={!posterDataUrl}
          className="flex-1 max-w-[160px] py-3 px-4 bg-surface border-2 border-foreground rounded-lg text-label font-bold shadow-card disabled:opacity-50"
        >
          保存海报
        </button>
        <button
          type="button"
          onClick={handleShare}
          disabled={!posterDataUrl}
          className="flex-1 max-w-[160px] py-3 px-4 bg-accent text-on-primary rounded-lg text-label font-bold shadow-button disabled:opacity-50"
        >
          分享
        </button>
      </div>

      <button type="button" onClick={handleReplay} className="btn-primary max-w-xs mx-auto">
        再玩一次
      </button>
    </div>
  );
}
