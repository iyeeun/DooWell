import { describe, expect, it } from 'vitest';
import type { Behavior } from '@/shared/components/behavior/BehaviorCard.types';
import { selectRecommendedBehavior } from './selectRecommendedBehavior';

const createBehavior = (overrides: Partial<Behavior>): Behavior => ({
  id: 'behavior-1',
  title: '행동',
  goalTitle: '목표',
  goalColor: 'mint',
  isChecked: false,
  difficulty: '시작하기',
  isRecommended: false,
  ...overrides,
});

describe('selectRecommendedBehavior', () => {
  it('미완료 행동 중 난이도가 가장 낮은 행동을 추천한다', () => {
    const behaviors = [
      createBehavior({ id: 'deep', difficulty: '몰입하기' }),
      createBehavior({ id: 'start', difficulty: '시작하기' }),
      createBehavior({ id: 'open', difficulty: '마음열기' }),
    ];

    expect(selectRecommendedBehavior(behaviors)?.id).toBe('open');
  });

  it('완료된 행동과 기존 AI 행동은 제외한다', () => {
    const behaviors = [
      createBehavior({ id: 'completed', difficulty: '마음열기', isChecked: true }),
      createBehavior({ id: 'ai', difficulty: 'AI' }),
      createBehavior({ id: 'next', difficulty: '이어가기' }),
    ];

    expect(selectRecommendedBehavior(behaviors)?.id).toBe('next');
  });

  it('추천할 미완료 행동이 없으면 undefined를 반환한다', () => {
    const behaviors = [createBehavior({ isChecked: true })];

    expect(selectRecommendedBehavior(behaviors)).toBeUndefined();
  });
});
