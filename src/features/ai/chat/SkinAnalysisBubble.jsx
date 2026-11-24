import AiAvatar from './AiAvatar';
import AnalyzingStatus from '@/components/AnalyzingStatus';

const bubbleClass =
  'max-w-[592px] rounded-[4px_18px_18px_18px] border border-line bg-white px-4 py-3 text-[15px] leading-relaxed text-ink';
const noteClass =
  'mt-2 border-t border-dashed border-line pt-2 text-sm text-subtle';
const primaryClass =
  'h-8 rounded-md bg-brand-500 px-3 text-base font-semibold text-white hover:bg-brand-600';

/** 등급: 이름·색(지켜보기 초록, 진료 권장 주황, 빨리 진료 빨강) */
const GRADE = {
  OBSERVE: ['지켜보기', 'bg-tone-green-bg text-tone-green-fg'],
  VISIT: ['진료 권장', 'bg-tone-amber-bg text-tone-amber-fg'],
  URGENT: ['빨리 진료', 'bg-tone-rose-bg text-tone-rose-fg'],
};
const CONFIDENCE = { HIGH: '확신 높음', MEDIUM: '확신 보통' };

/** AI 아바타 + 내용 */
function AiRow({ avatarPet, children }) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <AiAvatar pet={avatarPet} />
      <div className="flex min-w-0 flex-1 flex-col items-start gap-2">
        {children}
      </div>
    </div>
  );
}

/** 분석 결과: 판정했으면 등급·병변, 아니면 안내만. 참고 문구는 항상 */
function Result({ result }) {
  const isAnalyzed = result.rslt === 'ANALYZED';
  const grade = isAnalyzed ? GRADE[result.grade] : null;
  return (
    <section aria-label="피부 사진 분석 결과" className={bubbleClass}>
      {grade && (
        <p className="flex items-center gap-2">
          <span className="font-semibold">분석 결과</span>
          <span
            className={`rounded-full px-2.5 py-0.5 text-sm font-semibold leading-[1.25] ${grade[1]}`}
          >
            {grade[0]}
          </span>
        </p>
      )}
      {isAnalyzed && result.findings.length > 0 && (
        <ul className="mt-2 flex flex-col gap-1">
          {result.findings.map((finding) => (
            <li key={finding.lesionCd} className="flex items-center gap-2">
              <span className="font-semibold">{finding.lesionNm}</span>
              <span className="text-sm text-subtle">
                {CONFIDENCE[finding.cnfdnc] ?? ''}
              </span>
            </li>
          ))}
        </ul>
      )}
      {result.guide.length > 0 && (
        <ul
          className={`flex list-disc flex-col gap-1 pl-5 ${isAnalyzed ? 'mt-2' : ''}`}
        >
          {result.guide.map((line, index) => (
            <li key={index}>{line}</li>
          ))}
        </ul>
      )}
      <p className={noteClass}>{result.notice}</p>
    </section>
  );
}

/**
 * [대화창 피부 사진 분석 말풍선] (SCR-AIM-013)
 * - 분석 중·결과·실패, 사진 턴은 저장 메시지가 보여 준다
 * - 결과는 방에 저장되지 않는다(ai skin-card 전)
 */
export default function SkinAnalysisBubble({ skin, onRetry, avatarPet }) {
  return (
    <AiRow avatarPet={avatarPet}>
      {skin.status === 'analyzing' && (
        <p role="status" className={bubbleClass}>
          <AnalyzingStatus>피부 사진을 살펴보고 있어요</AnalyzingStatus>
        </p>
      )}
      {skin.status === 'result' && <Result result={skin.result} />}
      {skin.status === 'failed' && (
        <>
          <p role="alert" className={bubbleClass}>
            {skin.errorMessage}
          </p>
          {skin.isRetryable && (
            <button type="button" className={primaryClass} onClick={onRetry}>
              다시 시도
            </button>
          )}
        </>
      )}
    </AiRow>
  );
}
