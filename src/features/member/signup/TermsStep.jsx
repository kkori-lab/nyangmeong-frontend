import { Check, ChevronRight } from 'lucide-react';
import AuthCheckBox from '../shared/AuthCheckBox';
import { PRIMARY_BTN } from '../shared/authStyles';
import { hasTermsView } from '../shared/validate';
import { SIGNUP_MESSAGES as MSG } from './signupMessages';

// 약관 목록과 모두 동의. 이메일 가입 1단계와 SNS 가입 확인 화면이 같이 쓴다.
// lockedSn은 외부에서 이미 확인된 항목(만 14세)이라 체크 대신 "확인 완료"로 보이고 모두 동의로 바뀌지 않는다
export function TermsChecklist({ form, lockedSn }) {
  if (form.isTermsLoading) {
    return <p className="text-muted">{MSG.termsLoading}</p>;
  }
  if (form.isTermsError) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-danger">{MSG.termsFailed}</p>
        <button type="button" onClick={form.retryTerms} className={PRIMARY_BTN}>
          다시 시도
        </button>
      </div>
    );
  }
  return (
    <>
      <div className="mb-2 flex min-h-[46px] items-center rounded-md border border-line px-4 font-semibold">
        <AuthCheckBox checked={form.isAllChecked} onChange={form.toggleAll}>
          모두 동의
        </AuthCheckBox>
      </div>
      {form.termsList.map(
        ({ trmsSn, trmsFixIdntfKey, trmsTtl, esntlAgreYn }) => {
          const label = (
            <span>
              <em
                className={`mr-1.5 font-semibold not-italic ${
                  esntlAgreYn ? 'text-brand-600' : 'text-subtle'
                }`}
              >
                {esntlAgreYn ? '[필수]' : '[선택]'}
              </em>
              {trmsTtl}
            </span>
          );
          return (
            <div
              key={trmsSn}
              className="flex min-h-10 items-center px-4 text-ink-2"
            >
              {trmsSn === lockedSn ? (
                <div className="flex flex-1 items-center gap-3">
                  <span className="grid size-5 shrink-0 place-items-center rounded-xs border-[1.5px] border-brand-500 bg-brand-500">
                    <Check className="size-3.5 stroke-[3] text-white" />
                  </span>
                  {label}
                  <span className="ml-auto text-sm font-semibold text-brand-600">
                    확인 완료
                  </span>
                </div>
              ) : (
                <AuthCheckBox
                  checked={Boolean(form.terms[trmsSn])}
                  onChange={() => form.toggleTerm(trmsSn)}
                >
                  {label}
                </AuthCheckBox>
              )}
              {hasTermsView(trmsFixIdntfKey) && (
                <button
                  type="button"
                  onClick={() => form.openTerms(trmsSn)}
                  aria-label={`${trmsTtl} 내용보기`}
                  className="grid place-items-center text-subtle hover:text-ink"
                >
                  <ChevronRight className="size-4" />
                </button>
              )}
            </div>
          );
        },
      )}
    </>
  );
}

// 1단계. 서버가 준 약관 중 필수 항목에 모두 동의해야 다음으로 간다. 선택(마케팅)은 진행 조건이 아니다
export default function TermsStep({ form }) {
  if (form.isTermsLoading || form.isTermsError) {
    return <TermsChecklist form={form} />;
  }
  return (
    <>
      <TermsChecklist form={form} />
      <p className="mt-2 text-sm leading-5 text-muted">
        필수 약관에 모두 동의하면 다음으로 넘어갈 수 있어요.
      </p>
      <button
        type="button"
        disabled={!form.isTermsOk}
        onClick={() => form.goStep('email')}
        className={`${PRIMARY_BTN} mt-5`}
      >
        다음
      </button>
    </>
  );
}
