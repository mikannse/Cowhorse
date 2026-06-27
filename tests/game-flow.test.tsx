import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, vi } from 'vitest';
import App from '../src/App';
import { useGameStore } from '../src/engine/useGameStore';

vi.mock('html2canvas', () => ({
  default: vi.fn(() =>
    Promise.resolve({
      toDataURL: () => 'data:image/png;base64,mock',
    }),
  ),
}));

// Reset zustand store and URL between tests to prevent state leakage
beforeEach(() => {
  useGameStore.getState().resetGame();
  // Clear the URL so React Router starts at the title screen
  window.history.pushState({}, '', '/');
});

describe('CowHorse game flow', () => {
  it('reaches an ending by following the full job route (CS major)', async () => {
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

    // Event 1c: undergrad_summary — brief time-passage event summarizing 大一~大三
    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /该做决定了/ })).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    fireEvent.click(screen.getByRole('button', { name: /该做决定了/ }));

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

  it('follows the full job route after undergrad_summary time passage (finance major)', async () => {
    // Always roll 6
    vi.spyOn(Math, 'random').mockReturnValue(0.9);

    render(<App />);

    // Title → start
    expect(screen.getByText('社畜模拟器')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /开始游戏/ }));

    // choose_major — pick 金融
    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /金融/ })).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    fireEvent.click(screen.getByRole('button', { name: /金融/ }));

    // major_finance — continue
    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /开始大学生活/ })).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    fireEvent.click(screen.getByRole('button', { name: /开始大学生活/ }));

    // undergrad_summary — brief time passage
    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /该做决定了/ })).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    fireEvent.click(screen.getByRole('button', { name: /该做决定了/ }));

    // undergrad_start — choose 找工作
    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /找工作/ })).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    fireEvent.click(screen.getByRole('button', { name: /找工作/ }));

    // job_intro → 海投
    await waitFor(
      () => { expect(screen.getByRole('button', { name: /海投/ })).toBeInTheDocument(); },
      { timeout: 5000 },
    );
    fireEvent.click(screen.getByRole('button', { name: /海投/ }));

    // finance_job_waiting (dice=6) → 收到券商面试通知
    await waitFor(
      () => { expect(screen.getByRole('button', { name: /券商面试/ })).toBeInTheDocument(); },
      { timeout: 5000 },
    );
    fireEvent.click(screen.getByRole('button', { name: /券商面试/ }));

    // finance_job_interview (dice=6) → 条理清晰
    await waitFor(
      () => { expect(screen.getByRole('button', { name: /条理清晰/ })).toBeInTheDocument(); },
      { timeout: 5000 },
    );
    fireEvent.click(screen.getByRole('button', { name: /条理清晰/ }));

    // finance_job_offer → 干！投行就是拼
    await waitFor(
      () => { expect(screen.getByRole('button', { name: /投行就是拼/ })).toBeInTheDocument(); },
      { timeout: 5000 },
    );
    fireEvent.click(screen.getByRole('button', { name: /投行就是拼/ }));

    // finance_job_first_day → 埋头学
    await waitFor(
      () => { expect(screen.getByRole('button', { name: /埋头学/ })).toBeInTheDocument(); },
      { timeout: 5000 },
    );
    fireEvent.click(screen.getByRole('button', { name: /埋头学/ }));

    // finance_first_deal (dice=6) → 尽调获得认可
    await waitFor(
      () => { expect(screen.getByRole('button', { name: /客户认可/ })).toBeInTheDocument(); },
      { timeout: 5000 },
    );
    fireEvent.click(screen.getByRole('button', { name: /客户认可/ }));

    // finance_three_months → 继续拼
    await waitFor(
      () => { expect(screen.getByRole('button', { name: /继续拼/ })).toBeInTheDocument(); },
      { timeout: 5000 },
    );
    fireEvent.click(screen.getByRole('button', { name: /继续拼/ }));

    // finance_market_crossroads → 转买方
    await waitFor(
      () => { expect(screen.getByRole('button', { name: /PE\/VC/ })).toBeInTheDocument(); },
      { timeout: 5000 },
    );
    fireEvent.click(screen.getByRole('button', { name: /PE\/VC/ }));

    // finance_career_crossroads → 继续做MD
    await waitFor(
      () => { expect(screen.getByRole('button', { name: /MD/ })).toBeInTheDocument(); },
      { timeout: 5000 },
    );
    fireEvent.click(screen.getByRole('button', { name: /MD/ }));

    // Ending screen
    await waitFor(
      () => {
        const matches = screen.getAllByText(/(退休)|(社畜)|(功成)|(大佬)|(神话)|(护身符)|(自由)|(崩溃)|(梦想)|(游民)|(创业)/);
        expect(matches.length).toBeGreaterThanOrEqual(1);
      },
      { timeout: 5000 },
    );
  }, 60000);

  it('follows the law industry route via major-aware routing', async () => {
    // Always roll 6 (floor(0.9*6)+1 = 6)
    vi.spyOn(Math, 'random').mockReturnValue(0.9);

    render(<App />);

    // Title screen
    expect(screen.getByText('社畜模拟器')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /开始游戏/ }));

    // Event 1: choose_major — pick 法学
    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /法学/ })).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    fireEvent.click(screen.getByRole('button', { name: /法学/ }));

    // Event 1b: major_law — continue
    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /开始大学生活/ })).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    fireEvent.click(screen.getByRole('button', { name: /开始大学生活/ }));

    // Event 1c: undergrad_summary — brief time-passage event
    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /该做决定了/ })).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    fireEvent.click(screen.getByRole('button', { name: /该做决定了/ }));

    // Event 2: undergrad_start — choose 找工作
    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /找工作/ })).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    fireEvent.click(screen.getByRole('button', { name: /找工作/ }));

    // Event 3: job_intro — pick 海投, which routes via __route_by_major__
    // to law_job_waiting (instead of generic job_waiting)
    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /海投/ })).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    fireEvent.click(screen.getByRole('button', { name: /海投/ }));

    // Event 4: law_job_waiting (dice=6) → 收到红圈所面试通知
    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /红圈所面试/ })).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    fireEvent.click(screen.getByRole('button', { name: /红圈所面试/ }));

    // Event 5: law_job_interview (dice=6) → 对答如流
    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /对答如流/ })).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    fireEvent.click(screen.getByRole('button', { name: /对答如流/ }));

    // Event 6: law_job_offer → 接受，挂证最重要
    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /接受，挂证最重要/ })).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    fireEvent.click(screen.getByRole('button', { name: /接受，挂证最重要/ }));

    // Event 7: law_job_first_day → 埋头啃卷，不懂就问
    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /埋头啃卷/ })).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    fireEvent.click(screen.getByRole('button', { name: /埋头啃卷/ }));

    // Event 8: law_first_case (dice=6) → 代理词被采纳
    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /代理词被采纳/ })).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    fireEvent.click(screen.getByRole('button', { name: /代理词被采纳/ }));

    // Event 9: law_three_months → 坚持，律师这条路就是这样
    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /坚持，律师这条路就是这样/ })).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    fireEvent.click(screen.getByRole('button', { name: /坚持，律师这条路就是这样/ }));

    // Event 10: law_bar_crossroads → 继续跟带教，深耕专业方向
    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /继续跟带教/ })).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    fireEvent.click(screen.getByRole('button', { name: /继续跟带教/ }));

    // Event 11: law_two_years → 继续深耕诉讼，成为出庭律师
    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /继续深耕诉讼/ })).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    fireEvent.click(screen.getByRole('button', { name: /继续深耕诉讼/ }));

    // Event 12: law_career_crossroads → choose any → ending_reached
    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /继续奋斗，奔着合伙人去/ })).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    fireEvent.click(screen.getByRole('button', { name: /继续奋斗，奔着合伙人去/ }));

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
