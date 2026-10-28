import { ReceiptText } from 'lucide-react';
import aiCharacter from '@/assets/ai-character.png';
import { formatDate } from '@/utils/formatDate';
import { FAILURE } from '../receipt/receiptFailure';
import PetChoiceChips from './PetChoiceChips';

const EMPTY_MARK = '—';
const AI_NOTICE =
  'AI가 자동으로 인식·판정한 결과이며 실수가 있을 수 있습니다. 저장 전에 반드시 확인해 주세요.';

const bubbleClass =
  'max-w-[592px] rounded-[4px_18px_18px_18px] border border-[#e2e7e7] bg-white px-4 py-3 text-[15px] leading-relaxed text-[#1a3234]';
const noteClass =
  'mt-2 border-t border-dashed border-[#e2e7e7] pt-2 text-sm text-[#667374]';
const buttonClass =
  'h-8 rounded-md px-3 text-base font-semibold disabled:cursor-not-allowed disabled:border-0 disabled:bg-[#ebf0f0] disabled:text-[#b9c4c4]';
const primaryClass = `${buttonClass} bg-[#285a5c] text-white enabled:hover:bg-[#1e4a4c]`;
const secondaryClass = `${buttonClass} border border-[#e2e7e7] bg-white text-[#1a3234] enabled:hover:bg-[#f4f6f6]`;

const formatAmount = (amount) =>
  amount == null ? EMPTY_MARK : `${amount.toLocaleString()}원`;

/** 카드 표시 칸: 반려동물 구역별 금액은 이름을 칸 제목으로 */
const buildRows = (result) => [
  ['병원명', result.hsptlNm ?? EMPTY_MARK],
  ['검진일', result.ckupYmd ? formatDate(result.ckupYmd) : EMPTY_MARK],
  ['영수증 금액', formatAmount(result.recptAmt)],
  [
    '처방 약품',
    result.prscrptnCnt == null ? EMPTY_MARK : `${result.prscrptnCnt}건`,
  ],
  ...result.petAmts.map((petAmt) => [petAmt.petNm, formatAmount(petAmt.amt)]),
];

/** AI 아바타 + 내용 */
function AiRow({ children }) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <img
        src={aiCharacter}
        alt=""
        width="36"
        height="36"
        className="size-9 shrink-0 rounded-full border border-[#e2e7e7] bg-[#e9f2f2] object-contain p-1"
      />
      <div className="flex min-w-0 flex-1 flex-col items-start gap-2">
        {children}
      </div>
    </div>
  );
}

/** 결과 미리보기 카드 */
function ResultCard({ result, isDismissed, onConfirm, onDismiss }) {
  return (
    <section
      aria-label="영수증 분석 결과"
      className="w-full max-w-[520px] rounded-[14px] border border-[#e2e7e7] bg-white p-5"
    >
      <h2 className="flex items-center gap-2 text-base font-semibold text-[#1a3234]">
        <ReceiptText aria-hidden="true" className="size-5 text-[#285a5c]" />
        영수증을 이렇게 읽었어요.
      </h2>

      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 rounded-[10px] bg-[#f4f6f6] p-4">
        {buildRows(result).map(([label, value]) => (
          <div key={label} className="min-w-0">
            <dt className="text-sm text-[#667374]">{label}</dt>
            <dd className="break-words text-base font-semibold text-[#1a3234]">
              {value}
            </dd>
          </div>
        ))}
      </dl>

      <p className={noteClass}>{AI_NOTICE}</p>

      {isDismissed ? (
        <p className={noteClass}>취소됨</p>
      ) : (
        <div className="mt-4 flex gap-2">
          <button type="button" className={primaryClass} onClick={onConfirm}>
            확인 후 저장
          </button>
          <button type="button" className={secondaryClass} onClick={onDismiss}>
            취소
          </button>
        </div>
      )}
    </section>
  );
}

/**
 * [대화창 영수증 분석 말풍선]
 * - 보낸 이미지·글 + 단계별 AI 말풍선 (SCR-AIM-013), 글은 분석에 쓰지 않음
 * - 결과 카드는 미리보기, 저장은 본창 건강 일지 확인 모달
 */
export default function ReceiptAnalysisBubble({
  receipt,
  pets,
  onChoosePet,
  onCancel,
  onConfirm,
  onDismiss,
  onRetry,
  onManualInput,
}) {
  const { status, pet, result, failure } = receipt;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-end gap-2">
        <img
          src={receipt.previewUrl}
          alt={receipt.file.name}
          width="160"
          height="120"
          className="h-[120px] w-40 rounded-[10px] border border-[#e2e7e7] object-cover"
        />
        {receipt.text && (
          <p className="max-w-[592px] whitespace-pre-wrap rounded-[18px_4px_18px_18px] border border-[#e8d27e] bg-[#f9eaa6] px-4 py-3 text-[15px] leading-relaxed text-[#1a3234]">
            {receipt.text}
          </p>
        )}
      </div>

      {status === 'choosing' && (
        <>
          <AiRow>
            <p className={bubbleClass}>어느 반려동물의 영수증인가요?</p>
          </AiRow>
          <PetChoiceChips
            pets={pets}
            isDisabled={false}
            onSelect={(petNm) =>
              onChoosePet(pets.find((item) => item.petNm === petNm))
            }
          />
        </>
      )}

      {(status === 'analyzing' || status === 'cancelled') && (
        <AiRow>
          <div role="status" className={bubbleClass}>
            <p>{pet.petNm}의 영수증을 분석하고 있어요…</p>
            {status === 'cancelled' && <p className={noteClass}>취소됨</p>}
          </div>
          {status === 'analyzing' && (
            <button type="button" className={secondaryClass} onClick={onCancel}>
              취소
            </button>
          )}
        </AiRow>
      )}

      {(status === 'result' || status === 'dismissed') && (
        <AiRow>
          <ResultCard
            result={result}
            isDismissed={status === 'dismissed'}
            onConfirm={onConfirm}
            onDismiss={onDismiss}
          />
        </AiRow>
      )}

      {status === 'failed' && (
        <AiRow>
          <div role="alert" className={bubbleClass}>
            <p className="font-semibold">{FAILURE[failure].title}</p>
            <p>{FAILURE[failure].message}</p>
          </div>
          <div className="flex gap-2">
            <button type="button" className={primaryClass} onClick={onRetry}>
              다시 올리기
            </button>
            <button
              type="button"
              className={secondaryClass}
              onClick={onManualInput}
            >
              직접 입력
            </button>
          </div>
        </AiRow>
      )}
    </div>
  );
}
