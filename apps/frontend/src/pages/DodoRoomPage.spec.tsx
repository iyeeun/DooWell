import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useDodoRoom } from '@/features/dodoroom/hooks/useDodoRoom';
import { DODO_ACTION_VALUES } from '@web24/shared';
import { DodoRoomPage } from './DodoRoomPage';

vi.mock('@/features/dodoroom/hooks/useDodoRoom', () => ({
  useDodoRoom: vi.fn(),
}));

vi.mock('@/features/dodoroom/components/DodoSpeechBubble', () => ({
  DodoSpeechBubble: ({ text }: { text: string }) => <div data-testid="speech-bubble">{text}</div>,
}));

vi.mock('@/features/dodoroom/components/DodoCharacter', () => ({
  DodoCharacter: ({ action }: { action: string }) => (
    <div data-testid="dodo-character">{action}</div>
  ),
}));

vi.mock('@/features/dodoroom/components/DodoActionButton', () => ({
  DodoActionButton: ({ action, onClick }: { action: string; onClick: (value: string) => void }) => (
    <button type="button" data-testid={`action-btn-${action}`} onClick={() => onClick(action)}>
      {action}
    </button>
  ),
}));

describe('DodoRoomPage', () => {
  const handleActionButton = vi.fn();
  const handleInteraction = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useDodoRoom).mockReturnValue({
      dodoAction: 'None',
      quote: '한 걸음부터 시작해 보자.',
      behaviors: [
        {
          id: 'behavior-1',
          title: '물 한 잔 마시기',
          goalTitle: '건강',
          goalColor: 'mint',
          difficulty: '마음열기',
          isChecked: false,
          isRecommended: false,
        },
      ],
      completedCount: 0,
      recommendedBehavior: {
        id: 'behavior-1',
        title: '물 한 잔 마시기',
        goalTitle: '건강',
        goalColor: 'mint',
        difficulty: '마음열기',
        isChecked: false,
        isRecommended: false,
      },
      isLoading: false,
      handleActionButton,
      handleInteraction,
    });
  });

  it('오늘의 진행 상황과 다음 행동을 보여준다', () => {
    render(<DodoRoomPage />);

    expect(screen.getByText('오늘의 두두')).toBeInTheDocument();
    expect(screen.getByText('0/1')).toBeInTheDocument();
    expect(screen.getByText('물 한 잔 마시기')).toBeInTheDocument();
    expect(screen.queryByText('채팅')).not.toBeInTheDocument();
  });

  it('두두 애니메이션 버튼을 로컬에서 실행한다', () => {
    render(<DodoRoomPage />);

    DODO_ACTION_VALUES.filter((action) => action !== 'None').forEach((action) => {
      fireEvent.click(screen.getByTestId(`action-btn-${action}`));
      expect(handleActionButton).toHaveBeenCalledWith(action);
    });
  });

  it('선택형 상호작용을 실행한다', () => {
    render(<DodoRoomPage />);

    fireEvent.click(screen.getByRole('button', { name: '오늘 뭐 하지?' }));
    fireEvent.click(screen.getByRole('button', { name: '응원해 줘' }));
    fireEvent.click(screen.getByRole('button', { name: '오늘 수고했어' }));

    expect(handleInteraction).toHaveBeenNthCalledWith(1, 'next');
    expect(handleInteraction).toHaveBeenNthCalledWith(2, 'cheer');
    expect(handleInteraction).toHaveBeenNthCalledWith(3, 'praise');
  });
});
