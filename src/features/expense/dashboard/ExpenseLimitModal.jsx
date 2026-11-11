import { Bell } from 'lucide-react';
import { useState } from 'react';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import Modal from '@/components/Modal';
import { showToast } from '@/components/toastStore';
import { useSaveExpenseLimit } from '../queries';

const FORM_ID = 'expense-limit-form';
/** 한도 입력 최대 자리수 */
const MAX_DIGITS = 13;

export default function ExpenseLimitModal({ mmExpndLimAmt, onClose }) {
  const [digits, setDigits] = useState(
    mmExpndLimAmt == null ? '' : String(mmExpndLimAmt),
  );
  const saveLimit = useSaveExpenseLimit();
  const canSave = Number(digits) > 0;

  const handleChange = (event) => {
    const onlyDigits = event.target.value
      .replace(/\D/g, '')
      .replace(/^0+/, '')
      .slice(0, MAX_DIGITS);
    setDigits(onlyDigits);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canSave) return;
    saveLimit.mutate(Number(digits), {
      onSuccess: onClose,
      onError: () => showToast('저장하지 못했어요. 잠시 후 다시 시도해 주세요'),
    });
  };

  return (
    <Modal
      title="월 지출 한도 설정"
      isPending={saveLimit.isPending}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={saveLimit.isPending}
            className={BTN_SECONDARY}
          >
            취소
          </button>
          <button
            type="submit"
            form={FORM_ID}
            disabled={!canSave || saveLimit.isPending}
            className={BTN_PRIMARY}
          >
            저장
          </button>
        </>
      }
    >
      <form
        id={FORM_ID}
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
      >
        <div>
          <label htmlFor="expense-limit-amt" className="font-semibold">
            한도 금액
          </label>
          <div className="relative mt-2">
            <input
              id="expense-limit-amt"
              inputMode="numeric"
              autoComplete="off"
              value={
                digits === '' ? '' : Number(digits).toLocaleString('ko-KR')
              }
              onChange={handleChange}
              aria-describedby="expense-limit-help"
              className="block h-10 w-full rounded-md border border-input-line bg-white pr-9 pl-3 text-right tabular-nums hover:border-line-strong focus:border-brand-500 focus:ring-focus focus:outline-none"
            />
            <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-subtle">
              원
            </span>
          </div>
          <p id="expense-limit-help" className="mt-2 text-sm text-muted">
            한도의 90%를 넘으면 미리 알려드리고, 초과하면 다시 알려드려요
          </p>
        </div>
        <p className="flex items-center gap-2 rounded-box bg-surface-2 px-4 py-3 text-sm text-muted">
          <Bell className="size-4 shrink-0" aria-hidden="true" />
          한도를 저장하면 알림이 켜지며, 설정에서 끌 수 있어요
        </p>
      </form>
    </Modal>
  );
}
