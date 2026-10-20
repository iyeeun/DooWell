import { useEffect, useRef } from 'react';
import { Hero } from '@/features/home/components/Hero';
import useDodoChatStore from '@/stores/useDodoChatStore';
import { useDodoToast } from '@/shared/hooks/useDodoToast';
import { REWARD_LINES } from '@/features/goal/constants/dodo';
import { RecommendedBehaviorContainer } from '@/features/behavior/components/RecommendedBehaviorContainer';
import { TodayBehaviorList } from '@/features/behavior/components/TodayBehaviorList';
import { toast } from 'react-toastify';
import { getRandomElement } from '@/shared/utils/random';
import useAuthStore from '@/stores/useAuthStore';
import { useAutoWebPushSubscribe } from '@/features/push/hooks/useAutoWebPushSubscribe';
import { useToggleTodayBehaviorMutation } from '@/features/behavior/hooks/useToggleTodayBehaviorMutation';
import { useDeleteTodayBehaviorMutation } from '@/features/behavior/hooks/useDeleteTodayBehaviorMutation';
import { useRefreshTodayBehaviorsMutation } from '@/features/behavior/hooks/useRefreshTodayBehaviorsMutation';
import { useGoalsQuery } from '@/features/goal/hooks/useGoalsQuery';
import { useTodayBehaviorsQuery } from '@/features/behavior/hooks/useTodayBehaviorsQuery';
import { useTodayBehaviorsDisplay } from '@/features/behavior/hooks/useTodayBehaviorsDisplay';

export function IndexPage() {
  const { user } = useAuthStore();
  const { data: behaviors = [], isLoading: isLoadingBehaviors } = useTodayBehaviorsQuery(user?.id);
  const { data: goals = [] } = useGoalsQuery();

  const { mutate: toggleMutation } = useToggleTodayBehaviorMutation();
  const { mutate: deleteMutation } = useDeleteTodayBehaviorMutation();
  const { mutate: refreshMutation } = useRefreshTodayBehaviorsMutation();

  const { quote, resetQuote } = useDodoChatStore();
  const showToast = useDodoToast();
  const heroRef = useRef<HTMLDivElement>(null);
  const isHeroVisible = useRef(true);

  useAutoWebPushSubscribe({ enabled: !!user, mode: 'silent' });

  const headerHeightValue = getComputedStyle(document.documentElement)
    .getPropertyValue('--header-h')
    .trim();
  const headerHeight = Number.parseFloat(headerHeightValue) || 0;

  // Hero 섹션 보이는지 확인
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        isHeroVisible.current = entry.isIntersecting;
      },
      { threshold: 0.1, rootMargin: `-${headerHeight}px 0px 0px 0px` },
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => observer.disconnect();
  }, [headerHeight]);

  const handleRewardInteraction = (templateId?: string) => {
    const currentQuote = useDodoChatStore.getState().quote;

    const lines = (templateId && REWARD_LINES[templateId]) || REWARD_LINES.default;
    let rewardQuote = getRandomElement(lines) || '';
    if (lines.length > 1 && rewardQuote === currentQuote) {
      let nextQuote = rewardQuote;
      let attempts = 0;
      while (nextQuote === currentQuote && attempts < 5) {
        nextQuote = getRandomElement(lines) || '';
        attempts += 1;
      }
      rewardQuote = nextQuote;
    }

    useDodoChatStore.getState().setQuote(rewardQuote);
    if (!isHeroVisible.current) {
      showToast(rewardQuote, { position: 'top' });
    }
  };

  const { displayBehaviors, handleBehaviorToggle } = useTodayBehaviorsDisplay({
    behaviors,
    toggleMutation,
    handleRewardInteraction,
  });

  const handleBehaviorDelete = (id: string) => {
    deleteMutation(id, {
      onError: () => toast('삭제에 실패했습니다.'),
    });
  };

  const handleRefreshTodayBehaviors = () => {
    refreshMutation(undefined, {
      onError: () => toast('새로고침에 실패했습니다.'),
    });
  };

  useEffect(
    () => () => {
      resetQuote();
    },
    [resetQuote],
  );

  return (
    <div className="bg-bg-normal mx-auto flex max-w-5xl flex-col pt-2">
      {/* 두두의 말 */}
      <div ref={heroRef} className="mb-10">
        <Hero quote={quote} />
      </div>

      {/* 지금 시작하기 좋은 추천 행동 */}
      <RecommendedBehaviorContainer
        behaviors={displayBehaviors}
        isLoading={isLoadingBehaviors}
        onToggle={handleBehaviorToggle}
      />

      {/* 오늘의 행동 */}
      <TodayBehaviorList
        goals={goals}
        behaviors={displayBehaviors}
        onToggle={handleBehaviorToggle}
        onRefresh={handleRefreshTodayBehaviors}
        onDelete={handleBehaviorDelete}
      />
    </div>
  );
}
