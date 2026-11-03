import { useState } from 'react';
import Icon from '@/components/Icon';
import Modal from '@/components/Modal';
import { BTN_DANGER, BTN_SECONDARY } from '@/components/buttonStyles';
import { useDeleteEtcInspection } from '../queries';
import EtcInspectionModal from './EtcInspectionModal';
import { ADD_ROW, ROW_LINE, TEXT_BTN, TEXT_BTN_DEL } from './checkupStyles';

/**
 * [기타검사 목록]
 * - 검사명·결과(텍스트)·메모, 메모가 없으면 줄 생략. 참고범위·추이 이동 없음 (FN-HLT-005-02)
 * - 행 [수정] → 기타검사 입력 모달(값 채움), [삭제] → 확인 후 삭제, [＋ 기타검사 입력]은 목록 아래 상시
 */
export default function EtcResultList({ petSn, ckupRcdSn, etcInspections }) {
  /** 입력 모달: null이면 닫힘, { etcInspection }이 null이면 새로 입력 */
  const [modal, setModal] = useState(null);
  const [deleteSn, setDeleteSn] = useState(null);
  const deleteEtcInspection = useDeleteEtcInspection();

  const handleDelete = () =>
    deleteEtcInspection.mutate(
      { petSn, ckupRcdSn, etcInspSn: deleteSn },
      { onSuccess: () => setDeleteSn(null) },
    );

  return (
    <div>
      {etcInspections.length === 0 && <p className="text-muted">결과 없음</p>}
      <ul>
        {etcInspections.map((etc) => (
          <li
            key={etc.etcInspSn}
            className={`flex items-center gap-3.5 py-3.5 ${ROW_LINE}`}
          >
            <div className="min-w-0 flex-1">
              <p className="font-semibold break-words">{etc.inspNm}</p>
              <p className="mt-1 break-words whitespace-pre-line">
                {etc.inspRsltCn}
              </p>
              {etc.memoCn && (
                <p className="text-subtle break-words">메모 · {etc.memoCn}</p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <button
                type="button"
                className={TEXT_BTN}
                onClick={() => setModal({ etcInspection: etc })}
              >
                수정
              </button>
              <button
                type="button"
                className={TEXT_BTN_DEL}
                onClick={() => setDeleteSn(etc.etcInspSn)}
              >
                삭제
              </button>
            </div>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className={`${BTN_SECONDARY} ${ADD_ROW} w-full`}
        onClick={() => setModal({ etcInspection: null })}
      >
        <Icon name="add" className="text-lg" />
        기타검사 입력
      </button>

      {modal && (
        <EtcInspectionModal
          petSn={petSn}
          ckupRcdSn={ckupRcdSn}
          etcInspection={modal.etcInspection}
          onClose={() => setModal(null)}
        />
      )}

      {deleteSn !== null && (
        <Modal
          isConfirm
          title="이 기타검사를 삭제할까요?"
          isPending={deleteEtcInspection.isPending}
          onClose={() => setDeleteSn(null)}
          footer={
            <>
              <button
                type="button"
                className={BTN_SECONDARY}
                disabled={deleteEtcInspection.isPending}
                onClick={() => setDeleteSn(null)}
              >
                취소
              </button>
              <button
                type="button"
                className={BTN_DANGER}
                disabled={deleteEtcInspection.isPending}
                onClick={handleDelete}
              >
                삭제하기
              </button>
            </>
          }
        />
      )}
    </div>
  );
}
