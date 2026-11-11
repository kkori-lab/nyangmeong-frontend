import { useCallback, useMemo, useState } from 'react';
import { AiModalContext } from './aiModal';

/**
 * [AI 모달 상태] (SCR-COM-007, 모든 폭: 사람 결정 2026-11-11)
 * - 열림 여부, 본창에서 넘긴 첫 메시지·사진
 * - origin: 어디서 열었는지({ from: 'input', rect } | { from: 'fab' } | null), 여는 연출에만 쓴다
 * - openKey: 열 때마다 대화 화면 새로 그림 -> 다시 열면 새 대화(사람 결정 2026-11-10)
 */
export default function AiModalProvider({ children }) {
  const [state, setState] = useState({
    isOpen: false,
    openKey: 0,
    firstMessage: null,
    file: null,
    origin: null,
  });

  const open = useCallback(
    (firstMessage = null, file = null, origin = null) => {
      setState((prev) => ({
        isOpen: true,
        openKey: prev.openKey + 1,
        firstMessage: firstMessage || null,
        file: file ?? null,
        origin: origin ?? null,
      }));
    },
    [],
  );

  const close = useCallback(() => {
    setState((prev) =>
      prev.isOpen
        ? {
            ...prev,
            isOpen: false,
            firstMessage: null,
            file: null,
            origin: null,
          }
        : prev,
    );
  }, []);

  const value = useMemo(
    () => ({ ...state, open, close }),
    [state, open, close],
  );

  return (
    <AiModalContext.Provider value={value}>{children}</AiModalContext.Provider>
  );
}
