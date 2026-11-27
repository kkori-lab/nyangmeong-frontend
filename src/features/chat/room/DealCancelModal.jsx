/**
 * [거래 취소 요청 창] (매칭 완료~수령 대기, 채팅방 메뉴에서 연다)
 * - 사유를 왼쪽 세로 라디오로 고르거나 직접 입력(50자)해 보낸다(게시글 신고 모달 `ReportModal`과 같은 모양). 사유는 문자열 하나로 cnclRsn에 담긴다
 */
import { useState } from 'react';
import Modal from '@/components/Modal';
import { BTN_DANGER, BTN_SECONDARY } from '@/components/buttonStyles';
import { useDealAction } from '../queries';
import { MTCH_STTS } from '../shared/chatCodes';
import {
  DEAL_CANCEL_REASONS,
  OTHER_REASON,
  OTHER_REASON_MAX_LENGTH,
} from './dealSteps';

export default function DealCancelModal({ room, onClose }) {
  const [reasonIndex, setReasonIndex] = useState(0);
  const [etcReason, setEtcReason] = useState('');
  const { mutate, isPending } = useDealAction(room);
  const isEtc = DEAL_CANCEL_REASONS[reasonIndex] === OTHER_REASON;
  const reason = isEtc ? etcReason.trim() : DEAL_CANCEL_REASONS[reasonIndex];
  const isMatched = room.mtchDlngSttsCd === MTCH_STTS.MATCHED;

  const handleSend = () => {
    if (!reason || isPending) return;
    /** 성공 뒤 방을 다시 조회하면 대기 카드가 뜬다. 409(재요청 불가 등)도 서버 문구 토스트 뒤 창을 닫는다 */
    mutate({ action: 'dealCancel', cnclRsn: reason }, { onSettled: onClose });
  };

  return (
    <Modal
      isPending={isPending}
      title="거래 취소 요청"
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            className={BTN_SECONDARY}
            disabled={isPending}
            onClick={onClose}
          >
            닫기
          </button>
          <button
            type="button"
            className={BTN_DANGER}
            disabled={isPending || !reason}
            onClick={handleSend}
          >
            취소 요청 보내기
          </button>
        </>
      }
    >
      <p className="text-base font-medium text-ink">거래 취소를 요청할까요?</p>
      <p className="mt-1 mb-4 text-base leading-normal text-muted">
        {isMatched
          ? '상대가 동의하면 거래가 취소돼요. 상대가 7일 동안 응답하지 않으면 자동으로 취소돼요.'
          : '상대가 동의하면 거래가 취소돼요. 동의 전까지는 거래를 이어갈 수 있어요.'}
      </p>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-base font-semibold text-ink">
          취소 사유
        </legend>
        {DEAL_CANCEL_REASONS.map((label, index) => (
          <label
            key={label}
            className="flex cursor-pointer items-center gap-2 text-base text-ink-2"
          >
            <input
              type="radio"
              name="deal-cancel-reason"
              className="size-4 accent-brand-500"
              checked={index === reasonIndex}
              onChange={() => setReasonIndex(index)}
            />
            {label}
          </label>
        ))}
      </fieldset>
      {isEtc && (
        <input
          autoFocus
          aria-label="거래 취소 사유 직접 입력"
          maxLength={OTHER_REASON_MAX_LENGTH}
          placeholder={`사유를 입력해 주세요 (${OTHER_REASON_MAX_LENGTH}자)`}
          className="mt-2 h-11 w-full rounded-md border border-input-line px-3.5 outline-none focus:border-brand-500"
          value={etcReason}
          onChange={(event) => setEtcReason(event.target.value)}
        />
      )}
    </Modal>
  );
}
