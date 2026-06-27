import html2canvas from 'html2canvas-pro';

export async function renderPoster(): Promise<string> {
  const element = document.getElementById('life-resume-poster');
  if (!element) {
    throw new Error('Life resume poster element not found');
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#FAFAF8',
  });

  return canvas.toDataURL('image/png');
}

export function downloadPoster(dataUrl: string, filename = 'cowhorse-life-resume.png'): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function sharePoster(dataUrl: string): Promise<void> {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const file = new File([blob], 'cowhorse-life-resume.png', { type: 'image/png' });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({
      title: '我的人生简历',
      text: '来自 CowHorse 社畜模拟器',
      files: [file],
    });
    return;
  }

  // Fallback: copy to clipboard if supported
  if (navigator.clipboard && window.ClipboardItem) {
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    return;
  }

  throw new Error('Sharing not supported on this device');
}
