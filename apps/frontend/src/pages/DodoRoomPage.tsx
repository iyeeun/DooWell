import { DodoSpeechBubble } from '@/features/dodoroom/components/DodoSpeechBubble';
import { useDodoRoom } from '@/features/dodoroom/hooks/useDodoRoom';
import { DodoCharacter } from '@/features/dodoroom/components/DodoCharacter';
import { DODO_ACTION_VALUES } from '@web24/shared';
import { DodoActionButton } from '@/features/dodoroom/components/DodoActionButton';

export function DodoRoomPage() {
  const {
    dodoAction,
    quote,
    behaviors,
    completedCount,
    recommendedBehavior,
    isLoading,
    handleActionButton,
    handleInteraction,
  } = useDodoRoom();

  const progress =
    behaviors.length === 0 ? 0 : Math.round((completedCount / behaviors.length) * 100);

  return (
    <div className="mx-auto flex max-w-6xl flex-col px-4 py-4">
      <div className="flex flex-col gap-4 md:min-h-[55vh] md:flex-row">
        <section className="bg-bg-light/80 relative flex min-h-100 flex-1 items-center justify-center overflow-hidden rounded-3xl border border-transparent p-4 md:min-w-92">
          <img
            src="/BlueAndWhiteRoom.webp"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-black/5" />
          <div className="relative z-10 flex h-full w-full items-end justify-center rounded-2xl pb-10">
            <DodoSpeechBubble text={quote} />
            <DodoCharacter action={dodoAction} priority="high" />
          </div>
          <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-2">
            {DODO_ACTION_VALUES.filter((v) => v !== 'None').map((action) => (
              <DodoActionButton
                key={action}
                action={action}
                onClick={handleActionButton}
                disabled={false}
              />
            ))}
          </div>
        </section>

        <section className="border-primary-weak/60 bg-bg-light/80 flex w-full flex-col gap-6 rounded-3xl border p-6 md:max-w-md">
          <div>
            <h2 className="text-label-normal text-lg font-bold">오늘의 두두</h2>
            <p className="text-label-alternative mt-1 text-sm">
              두두와 함께 오늘의 한 걸음을 이어가요.
            </p>
          </div>

          <div className="bg-bg-alternative/60 rounded-2xl p-5">
            <div className="flex items-center justify-between text-sm font-semibold">
              <span>오늘의 진행</span>
              <span>{isLoading ? '-' : `${completedCount}/${behaviors.length}`}</span>
            </div>
            <div className="bg-bg-alternative mt-3 h-2 overflow-hidden rounded-full">
              <div
                className="bg-primary-strong h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="bg-primary-weak/30 rounded-2xl p-5">
            <div className="text-label-alternative text-xs font-semibold">지금 해볼 행동</div>
            <div className="text-label-normal mt-2 font-bold">
              {isLoading
                ? '행동을 살펴보는 중...'
                : (recommendedBehavior?.title ??
                  (behaviors.length === 0
                    ? '오늘의 행동을 추가해 보세요.'
                    : '오늘의 행동을 모두 마쳤어요!'))}
            </div>
            {recommendedBehavior && (
              <div className="text-label-alternative mt-1 text-sm">
                {recommendedBehavior.goalTitle}
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <button
              type="button"
              onClick={() => handleInteraction('next')}
              className="bg-primary-strong text-bg-light rounded-xl px-4 py-3 text-sm font-semibold"
            >
              오늘 뭐 하지?
            </button>
            <button
              type="button"
              onClick={() => handleInteraction('cheer')}
              className="bg-bg-alternative text-label-normal rounded-xl px-4 py-3 text-sm font-semibold"
            >
              응원해 줘
            </button>
            <button
              type="button"
              onClick={() => handleInteraction('praise')}
              className="bg-bg-alternative text-label-normal rounded-xl px-4 py-3 text-sm font-semibold"
            >
              오늘 수고했어
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
