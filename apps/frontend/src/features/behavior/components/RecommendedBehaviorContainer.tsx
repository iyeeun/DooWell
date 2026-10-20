import { BehaviorCard } from '@/shared/components/behavior/BehaviorCard';
import type { Behavior } from '@/shared/components/behavior/BehaviorCard.types';
import { ICON_SIZE } from '@/shared/constants/icon';
import { selectRecommendedBehavior } from '../utils/selectRecommendedBehavior';

interface RecommendedBehaviorContainerProps {
  behaviors: Behavior[];
  onToggle: (behavior: Behavior) => void;
  isLoading: boolean;
}

const containerClassName =
  'animate-in fade-in slide-in-from-top-4 border-primary-weak/60 bg-primary-weak/30 relative mb-10 min-h-55 overflow-hidden rounded-4xl border p-6 duration-500';

export function RecommendedBehaviorContainer({
  behaviors,
  onToggle,
  isLoading,
}: RecommendedBehaviorContainerProps) {
  const recommendedBehavior = selectRecommendedBehavior(behaviors);

  if (isLoading) {
    return (
      <section className={containerClassName} aria-label="추천 행동">
        <div className="absolute inset-0 flex items-center justify-center gap-5">
          <img src="/DodoFace.png" alt="두두 얼굴" width={ICON_SIZE['3xl']} />
          <p>지금 하기 좋은 행동을 고르는 중...</p>
        </div>
      </section>
    );
  }

  if (!recommendedBehavior) {
    const message =
      behaviors.length === 0
        ? '오늘의 행동을 추가하면 바로 시작하기 좋은 행동을 골라드려요.'
        : '오늘의 행동을 모두 완료했어요!';

    return (
      <section className={containerClassName} aria-label="추천 행동">
        <div className="text-label-normal absolute inset-0 flex items-center justify-center px-6 text-center font-semibold">
          {message}
        </div>
      </section>
    );
  }

  return (
    <section className={containerClassName} aria-labelledby="recommended-behavior-title">
      <div className="relative z-10">
        <div className="mb-4 px-1">
          <h3 id="recommended-behavior-title" className="text-label-normal text-lg font-bold">
            추천 행동
          </h3>
          <p className="text-label-disable mt-1 text-xs font-medium">
            지금 바로 시작하기 가장 쉬운 행동 하나예요
          </p>
        </div>

        <div className="max-w-xl">
          <BehaviorCard behavior={recommendedBehavior} onToggle={onToggle} />
        </div>
      </div>
    </section>
  );
}
