import { useState } from 'react';
import { useHealthWidgets } from '../queries';
import WidgetTutorialModal from './WidgetTutorialModal';

/**
 * [건강 대시보드 튜토리얼 자동 열림] (※신규 정책, 2026-11-26)
 * - 종합 건강기록·건강 일지·케어 캘린더 세 화면이 같이 쓴다. 반려동물이 1마리 이상일 때만 페이지가 그린다(0마리는 등록 안내만)
 * - 대시보드 항목을 저장한 적이 없는 회원(data === null, savedYn=false)이면 보던 화면 위에 튜토리얼 1단계를 연다. 화면 이동 없음
 * - 불러오는 중·조회 실패·이미 저장한 회원은 열지 않음(덮어쓰기 방지, HealthDashboard isReplay와 같은 기준)
 * - 닫기 규칙은 WidgetTutorialModal 그대로: 4단계 완료는 고른 항목 저장, [나중에 할래요]·×·Esc·배경은 추천 3개 저장(실패해도 닫힘)
 * - 이 화면에서 한 번 닫았으면 저장에 실패해도 다시 열지 않음(다음 진입 때 다시 열림)
 * - onClose: 닫힌 뒤 부모에 알림. 종합 건강기록은 ?tutorial=1 요청을 끄는 데 써서 튜토리얼이 두 번 뜨지 않게 한다
 */
export default function WidgetTutorialGate({ mbrSn, petSn, petNm, onClose }) {
  const widgets = useHealthWidgets(mbrSn);
  const [isDone, setIsDone] = useState(false);

  const isOpen = widgets.isSuccess && widgets.data === null && !isDone;
  if (!isOpen) return null;

  return (
    <WidgetTutorialModal
      mode="tutorial"
      mbrSn={mbrSn}
      petSn={petSn}
      petNm={petNm}
      savedIds={[]}
      onClose={() => {
        setIsDone(true);
        onClose?.();
      }}
    />
  );
}
