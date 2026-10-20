import { BEHAVIOR_DIFFICULTIES } from '@web24/shared';
import type { Behavior } from '@/shared/components/behavior/BehaviorCard.types';

const difficultyRank = new Map(
  BEHAVIOR_DIFFICULTIES.map((difficulty, index) => [difficulty, index]),
);

export function selectRecommendedBehavior(behaviors: Behavior[]): Behavior | undefined {
  return behaviors
    .filter((behavior) => !behavior.isChecked && behavior.difficulty !== 'AI')
    .reduce<Behavior | undefined>((recommended, behavior) => {
      if (!recommended) return behavior;

      const recommendedRank = difficultyRank.get(recommended.difficulty) ?? Number.MAX_SAFE_INTEGER;
      const behaviorRank = difficultyRank.get(behavior.difficulty) ?? Number.MAX_SAFE_INTEGER;

      return behaviorRank < recommendedRank ? behavior : recommended;
    }, undefined);
}
