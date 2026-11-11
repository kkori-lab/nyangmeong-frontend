import { useCallback } from 'react';
import { useAiModal } from '@/context/aiModal';

/**
 * AI 매니저 열기: 모든 폭에서 같은 창의 AI 모달(사람 결정 2026-11-11, 새 창 안 씀)
 * open(firstMessage?, file?, origin?)
 * - origin: { from: 'input', rect } 메인 검색창 자리에서 / { from: 'fab' } 플로팅 버튼에서 / 없으면 그냥 열기
 */
export default function useAiWindow() {
  const { open: openAiModal } = useAiModal();
  return useCallback(
    (firstMessage, file, origin) => openAiModal(firstMessage, file, origin),
    [openAiModal],
  );
}
