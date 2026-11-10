import { createContext, useContext } from 'react';
import { openInMainWindow } from './openInMainWindow';

/**
 * [AI 대화 화면 호스트]
 * - 대화 화면이 놓인 곳(새 창·모달)별 본창 이동 방법
 * - 기본값: 새 창 -> 본창 이동 뒤 이 창 닫기
 * - 모달: 같은 창 안 이동 뒤 모달 닫기
 */
export const AiHostContext = createContext({ openMain: openInMainWindow });

/** 본창 이동 함수 */
export const useOpenMain = () => useContext(AiHostContext).openMain;
