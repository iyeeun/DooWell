import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Behavior } from '@/shared/components/behavior/BehaviorCard.types';
import { RecommendedBehaviorContainer } from './RecommendedBehaviorContainer';

const behavior: Behavior = {
  id: 'behavior-1',
  title: '물 한 잔 마시기',
  goalTitle: '건강',
  goalColor: 'mint',
  isChecked: false,
  difficulty: '마음열기',
  isRecommended: false,
};

describe('RecommendedBehaviorContainer', () => {
  it('지금 시작하기 쉬운 행동 하나를 보여준다', () => {
    render(
      <RecommendedBehaviorContainer behaviors={[behavior]} onToggle={vi.fn()} isLoading={false} />,
    );

    expect(screen.getByText('추천 행동')).toBeInTheDocument();
    expect(screen.getByText('물 한 잔 마시기')).toBeInTheDocument();
    expect(screen.queryByText(/AI/)).not.toBeInTheDocument();
  });

  it('추천 행동을 완료할 수 있다', () => {
    const onToggle = vi.fn();
    render(
      <RecommendedBehaviorContainer behaviors={[behavior]} onToggle={onToggle} isLoading={false} />,
    );

    fireEvent.click(screen.getByLabelText('물 한 잔 마시기 완료 토글'));
    expect(onToggle).toHaveBeenCalledWith(behavior);
  });

  it('모든 행동을 완료하면 완료 메시지를 보여준다', () => {
    render(
      <RecommendedBehaviorContainer
        behaviors={[{ ...behavior, isChecked: true }]}
        onToggle={vi.fn()}
        isLoading={false}
      />,
    );

    expect(screen.getByText('오늘의 행동을 모두 완료했어요!')).toBeInTheDocument();
  });
});
