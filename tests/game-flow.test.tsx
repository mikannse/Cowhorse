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
    // Always roll 6 (floor(0.9*6)+1 = 6)
    vi.spyOn(Math, 'random').mockReturnValue(0.9);

    render(<App />);

    // Title screen
    expect(screen.getByText('社畜模拟器')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /开始游戏/ }));

    // Event 1: undergrad_start — choose 找工作
    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /找工作/ })).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    fireEvent.click(screen.getByRole('button', { name: /找工作/ }));

    // Event 2: job_intro — choose 海投
    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /海投/ })).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    fireEvent.click(screen.getByRole('button', { name: /海投/ }));

    // Event 3: job_waiting (dice=6) → 收到面试通知
    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /收到面试通知/ })).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    fireEvent.click(screen.getByRole('button', { name: /收到面试通知/ }));

    // Event 4: job_interview (dice=6) → 超常发挥，对答如流
    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /超常发挥/ })).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    fireEvent.click(screen.getByRole('button', { name: /超常发挥/ }));

    // Event 5: job_offer → 直接接受
    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /直接接受/ })).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    fireEvent.click(screen.getByRole('button', { name: /直接接受/ }));

    // Event 6: job_first_day → 埋头干活
    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /埋头干活/ })).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    fireEvent.click(screen.getByRole('button', { name: /埋头干活/ }));

    // Event 7: job_three_months (dice=6) → 转正成功
    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /转正成功/ })).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    fireEvent.click(screen.getByRole('button', { name: /转正成功/ }));

    // Event 8: job_one_year → 努力奋斗
    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /努力奋斗/ })).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    fireEvent.click(screen.getByRole('button', { name: /努力奋斗/ }));

    // Ending screen
    await waitFor(
      () => {
        const matches = screen.getAllByText(/(退休)|(社畜)|(功成)|(大佬)|(神话)|(护身符)|(自由)|(崩溃)/);
        expect(matches.length).toBeGreaterThanOrEqual(1);
      },
      { timeout: 5000 },
    );
  }, 30000);
});
