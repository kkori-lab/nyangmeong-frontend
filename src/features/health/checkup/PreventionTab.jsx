import { useState } from 'react';
import Badge from '@/components/Badge';
import Card from '@/components/Card';
import Icon from '@/components/Icon';
import Modal from '@/components/Modal';
import { BTN_DANGER, BTN_SECONDARY } from '@/components/buttonStyles';
import { formatDate } from '@/utils/formatDate';
import { getCycleName } from '../careDue';
import EmptyBox from '../diary/EmptyBox';
import { useCancelPrevention } from '../queries';
import PreventionForm from './PreventionForm';
import { ADD_ROW, ROW_LINE, TEXT_BTN_DEL } from './checkupStyles';
import { PREVENTION_ITEMS, findName } from './checkupTypes';

/**
 * [반복 예방 탭]
 * - 목록 행: 예방 항목·반복 주기·다음 예정일·연동 뱃지·[해지] (FN-HLT-005-05)
 * - [해지]는 확인 뒤 반복 주기를 해지하고 자동 추가된 케어 항목을 삭제(완료 기록은 유지)
 */
export default function PreventionTab({ petSn, ckupRcdSn, preventions }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [cancelSn, setCancelSn] = useState(null);
  const cancelPrevention = useCancelPrevention();

  const handleCancel = () =>
    cancelPrevention.mutate(
      { ckupRcdSn, prvntSn: cancelSn },
      { onSuccess: () => setCancelSn(null) },
    );

  return (
    <Card title="반복 예방 관리" sub="선택 입력">
      {preventions.length === 0 ? (
        <EmptyBox
          icon="pest_control"
          title="심장사상충 예방·구충제를 등록하면 케어 캘린더에 주기대로 추가돼요"
        />
      ) : (
        <ul>
          {preventions.map((prevention) => (
            <li
              key={prevention.prvntSn}
              className={`flex items-center gap-3.5 py-3.5 ${ROW_LINE}`}
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-[10px] border border-line bg-surface-2 text-ink-2">
                <Icon name="pest_control" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">
                  {findName(PREVENTION_ITEMS, prevention.prvntItmCd)}
                </span>
                <span className="block text-subtle tabular-nums">
                  {getCycleName({
                    rptCycleCd: prevention.rptCycleCd,
                    rptCycleDayCnt: prevention.rptCycleDayCnt,
                  })}{' '}
                  주기
                  {prevention.nextSchdYmd &&
                    ` · 다음 예정 ${formatDate(prevention.nextSchdYmd)}`}
                </span>
              </span>
              <Badge tone="brand">처방약 연동</Badge>
              <button
                type="button"
                className={TEXT_BTN_DEL}
                onClick={() => setCancelSn(prevention.prvntSn)}
              >
                해지
              </button>
            </li>
          ))}
        </ul>
      )}

      {!isFormOpen && (
        <button
          type="button"
          className={`${BTN_SECONDARY} ${ADD_ROW} w-full`}
          onClick={() => setIsFormOpen(true)}
        >
          <Icon name="add" className="text-lg" />
          반복 예방 추가
        </button>
      )}
      {isFormOpen && (
        <PreventionForm
          petSn={petSn}
          ckupRcdSn={ckupRcdSn}
          onClose={() => setIsFormOpen(false)}
        />
      )}

      {cancelSn !== null && (
        <Modal
          isConfirm
          title="반복 예방을 해지할까요?"
          description="자동 추가된 케어 항목은 삭제되고, 완료된 기록 내용은 남아요"
          isPending={cancelPrevention.isPending}
          onClose={() => setCancelSn(null)}
          footer={
            <>
              <button
                type="button"
                className={BTN_SECONDARY}
                disabled={cancelPrevention.isPending}
                onClick={() => setCancelSn(null)}
              >
                취소
              </button>
              <button
                type="button"
                className={BTN_DANGER}
                disabled={cancelPrevention.isPending}
                onClick={handleCancel}
              >
                해지하기
              </button>
            </>
          }
        />
      )}
    </Card>
  );
}
