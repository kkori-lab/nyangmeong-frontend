import { Check, ChevronRight } from 'lucide-react';
import { PRIMARY_BTN } from '../shared/authStyles';
import { hasTermsView } from '../shared/validate';
import { SIGNUP_MESSAGES as MSG } from './signupMessages';

function CheckBox({ checked, onChange, children }) {
  return (
    <label className="flex flex-1 cursor-pointer items-center gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
      />
      <span className="grid size-5 shrink-0 place-items-center rounded-xs border-[1.5px] border-line-strong bg-white peer-checked:border-brand-500 peer-checked:bg-brand-500 peer-checked:[&_svg]:opacity-100 peer-focus-visible:ring-focus">
        <Check className="size-3.5 stroke-[3] text-white opacity-0" />
      </span>
      {children}
    </label>
  );
}

// 1단계. 서버가 준 약관 중 필수 항목에 모두 동의해야 다음으로 간다. 선택(마케팅)은 진행 조건이 아니다
export default function TermsStep({ form }) {
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
        <CheckBox checked={form.isAllChecked} onChange={form.toggleAll}>
          모두 동의
        </CheckBox>
      </div>
      {form.termsList.map(
        ({ trmsSn, trmsFixIdntfKey, trmsTtl, esntlAgreYn }) => (
          <div
            key={trmsSn}
            className="flex min-h-10 items-center px-4 text-ink-2"
          >
            <CheckBox
              checked={Boolean(form.terms[trmsSn])}
              onChange={() => form.toggleTerm(trmsSn)}
            >
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
            </CheckBox>
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
        ),
      )}
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
