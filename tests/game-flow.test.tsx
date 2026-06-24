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
  it('reaches an ending by following the full job route', async () => {
    // Always roll 6 (floor(0.9*6)+1 = 6)
    vi.spyOn(Math, 'random').mockReturnValue(0.9);

    render(<App />);

    // Title screen
    expect(screen.getByText('社畜模拟器')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /开始游戏/ }));

    // Event 1: choose_major — pick CS
    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /计算机/ })).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    fireEvent.click(screen.getByRole('button', { name: /计算机/ }));

    // Event 1b: major_cs — continue
    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /开始大学生活/ })).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    fireEvent.click(screen.getByRole('button', { name: /开始大学生活/ }));

    // Event 2: undergrad_start — choose 找工作
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

    // Event 4: job_interview (dice=6) → 超常发挥
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

    // Event 9: job_two_years → 继续深耕
    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /继续深耕/ })).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    fireEvent.click(screen.getByRole('button', { name: /继续深耕/ }));

    // Event 10: job_crisis (dice=6) → 裁员风波中幸存
    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /裁员风波中幸存/ })).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    fireEvent.click(screen.getByRole('button', { name: /裁员风波中幸存/ }));

    // Event 11: job_promoted → 好好干管理
    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /好好干管理/ })).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    fireEvent.click(screen.getByRole('button', { name: /好好干管理/ }));

    // Event 12: job_health_wakeup → 该做选择了（single choice, auto-advance）
    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /该做选择了/ })).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    fireEvent.click(screen.getByRole('button', { name: /该做选择了/ }));

    // Event 13: job_career_crossroads → 继续奋斗
    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /继续奋斗/ })).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    fireEvent.click(screen.getByRole('button', { name: /继续奋斗/ }));

    // Event 14: job_five_years → 继续，已经习惯了
    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /继续，已经习惯了/ })).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    fireEvent.click(screen.getByRole('button', { name: /继续，已经习惯了/ }));

    // Event 15: job_late_career → 够了，规划退休吧
    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /够了，规划退休吧/ })).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    fireEvent.click(screen.getByRole('button', { name: /够了，规划退休吧/ }));

    // Ending screen
    await waitFor(
      () => {
        const matches = screen.getAllByText(/(退休)|(社畜)|(功成)|(大佬)|(神话)|(护身符)|(自由)|(崩溃)|(梦想)|(游民)|(创业)/);
        expect(matches.length).toBeGreaterThanOrEqual(1);
      },
      { timeout: 5000 },
    );
  }, 60000);
});
