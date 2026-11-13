import { useCallback, useEffect, useRef, useState } from 'react';
import { bakeAdminItem } from './api';

/** 서버 오류 코드별 문구: 없으면 서버 message */
const BAKE_ERROR_MESSAGES = {
  BAKE_DISABLED: '굽기가 꺼져 있어요',
  INVALID_REQUEST: '굽기 대상이 아니거나 판매 중지된 아이템이에요',
  EXTERNAL_API_ERROR: '굽기에 실패했어요. 잠시 후 다시 시도해 주세요',
  CHARACTER_API_ERROR: '굽기에 실패했어요. 잠시 후 다시 시도해 주세요',
};

/** 전체 굽기 대상: 판매 중이고 굽기 지시가 있거나 그림 참고(서버 굽기 대상과 같음) */
export const canBakeItem = (item) =>
  item.ntslYn && (Boolean(item.bakeHint) || Boolean(item.bakeImgRefYn));

/**
 * [아이템 전체 굽기]
 * - 한 묶음씩 굽는 AI 요청을 lastYn이 true가 될 때까지 이어 부르고 건수를 더한다
 * - 요청마다 새 쿠키가 붙어 30분 만료에 걸리지 않는다
 * - stop()이나 화면을 떠나면 지금 묶음이 끝난 뒤 다음 요청을 보내지 않는다
 * - 한 번에 한 아이템만: 굽는 중 start()는 무시
 * bake: null | { itemSn, itemNm, status(running|stopping|done|stopped|error), bakedCnt, failedCnt, errorMessage }
 */
export function useItemBake() {
  const [bake, setBake] = useState(null);
  const runningRef = useRef(false);
  const stopRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const start = useCallback(async ({ itemSn, itemNm }) => {
    if (runningRef.current) return;
    runningRef.current = true;
    stopRef.current = false;
    let bakedCnt = 0;
    let failedCnt = 0;
    const update = (status, extra = {}) =>
      setBake({ itemSn, itemNm, status, bakedCnt, failedCnt, ...extra });
    update('running');
    try {
      for (;;) {
        const result = await bakeAdminItem(itemSn);
        bakedCnt += result.bakedCnt;
        failedCnt += result.failedCnt;
        if (result.lastYn) {
          update('done');
          return;
        }
        if (stopRef.current || !mountedRef.current) {
          update('stopped');
          return;
        }
        update('running');
      }
    } catch (error) {
      update('error', {
        errorMessage: BAKE_ERROR_MESSAGES[error.code] ?? error.message,
      });
    } finally {
      runningRef.current = false;
    }
  }, []);

  const stop = useCallback(() => {
    if (!runningRef.current) return;
    stopRef.current = true;
    setBake((current) => current && { ...current, status: 'stopping' });
  }, []);

  /** 끝난 진행 줄 닫기: 굽는 중이면 닫지 않음 */
  const dismiss = useCallback(() => {
    if (!runningRef.current) setBake(null);
  }, []);

  return { bake, start, stop, dismiss };
}
