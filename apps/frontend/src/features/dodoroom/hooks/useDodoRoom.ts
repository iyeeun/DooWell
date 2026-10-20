import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DODO_ACTIONS, type DodoAction } from '@web24/shared';
import useAuthStore from '@/stores/useAuthStore';
import { useTodayBehaviorsQuery } from '@/features/behavior/hooks/useTodayBehaviorsQuery';
import { selectRecommendedBehavior } from '@/features/behavior/utils/selectRecommendedBehavior';

export type DodoRoomInteraction = 'next' | 'cheer' | 'praise';

const ANIMATION_DURATION_MS = 5_000;

const ACTION_QUOTES: Record<Exclude<DodoAction, 'None'>, string> = {
  [DODO_ACTIONS.sitDown]: '잠깐 쉬어 가도 괜찮아. 다시 시작할 힘을 모아 보자!',
  [DODO_ACTIONS.wink]: '잘하고 있어! 두두가 계속 응원할게.',
  [DODO_ACTIONS.hurray]: '오늘도 여기까지 온 것만으로 멋져! 만세!',
};

export function useDodoRoom() {
  const { user } = useAuthStore();
  const { data: behaviors = [], isLoading } = useTodayBehaviorsQuery(user?.id);
  const [dodoAction, setDodoAction] = useState<DodoAction>(DODO_ACTIONS.none);
  const [interactionQuote, setInteractionQuote] = useState<string>();
  const actionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const completedCount = behaviors.filter((behavior) => behavior.isChecked).length;
  const recommendedBehavior = useMemo(() => selectRecommendedBehavior(behaviors), [behaviors]);

  const statusQuote = useMemo(() => {
    if (isLoading) return '오늘의 행동을 살펴보고 있어...';
    if (behaviors.length === 0) return '오늘 할 행동을 하나 추가해 볼까?';
    if (completedCount === behaviors.length) return '오늘의 행동을 모두 완료했어! 정말 멋져!';
    if (completedCount === 0) return '가장 쉬운 행동부터 가볍게 시작해 보자.';
    return `${completedCount}개나 해냈어! 이 흐름 그대로 이어가 보자.`;
  }, [behaviors.length, completedCount, isLoading]);

  const animateDodo = useCallback((action: Exclude<DodoAction, 'None'>) => {
    if (actionTimeoutRef.current) clearTimeout(actionTimeoutRef.current);
    setDodoAction(action);
    actionTimeoutRef.current = setTimeout(() => {
      setDodoAction(DODO_ACTIONS.none);
      actionTimeoutRef.current = null;
    }, ANIMATION_DURATION_MS);
  }, []);

  const handleActionButton = useCallback(
    (action: Exclude<DodoAction, 'None'>) => {
      animateDodo(action);
      setInteractionQuote(ACTION_QUOTES[action]);
    },
    [animateDodo],
  );

  const handleInteraction = useCallback(
    (interaction: DodoRoomInteraction) => {
      if (interaction === 'next') {
        setInteractionQuote(
          recommendedBehavior
            ? `지금은 “${recommendedBehavior.title}”부터 해보는 건 어때?`
            : '오늘 할 행동은 모두 끝났어. 마음껏 쉬어도 좋아!',
        );
        animateDodo(DODO_ACTIONS.sitDown);
        return;
      }

      if (interaction === 'cheer') {
        setInteractionQuote('완벽하지 않아도 괜찮아. 작은 한 걸음이면 충분해!');
        animateDodo(DODO_ACTIONS.wink);
        return;
      }

      setInteractionQuote('오늘도 정말 수고했어. 두두가 크게 축하해 줄게!');
      animateDodo(DODO_ACTIONS.hurray);
    },
    [animateDodo, recommendedBehavior],
  );

  useEffect(
    () => () => {
      if (actionTimeoutRef.current) clearTimeout(actionTimeoutRef.current);
    },
    [],
  );

  return {
    behaviors,
    completedCount,
    recommendedBehavior,
    isLoading,
    dodoAction,
    quote: interactionQuote ?? statusQuote,
    handleActionButton,
    handleInteraction,
  };
}
