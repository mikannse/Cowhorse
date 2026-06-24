import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../src/App';

vi.mock('html2canvas', () => ({
  default: vi.fn(() =>
    Promise.resolve({
      toDataURL: () => 'data:image/png;base64,mock',
    }),
  ),
}));

describe('CowHorse game flow', () => {
  it('reaches an ending by following the job route', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.9);

    render(<App />);

    expect(screen.getByText('社畜模拟器')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /开始游戏/ }));

    await waitFor(
      () => {
        expect(screen.getByText(/大四开学/)).toBeInTheDocument();
      },
      { timeout: 5000 },
    );

    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /找工作/ })).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    fireEvent.click(screen.getByRole('button', { name: /找工作/ }));

    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /海投/ })).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    fireEvent.click(screen.getByRole('button', { name: /海投/ }));

    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /秀出准备/ })).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    fireEvent.click(screen.getByRole('button', { name: /秀出准备/ }));

    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /努力工作/ })).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    fireEvent.click(screen.getByRole('button', { name: /努力工作/ }));

    // Ending screen — "平稳退休" appears in both the header and the poster
    await waitFor(
      () => {
        expect(screen.getAllByText(/(退休)|(社畜)/).length).toBeGreaterThanOrEqual(1);
      },
      { timeout: 5000 },
    );
  }, 30000);
});
