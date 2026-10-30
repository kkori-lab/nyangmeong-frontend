import { Check } from 'lucide-react';

// 약관 동의 같은 체크박스 한 줄. 가입 약관 단계(TermsStep)의 것과 모양이 같다
export default function AuthCheckBox({ checked, onChange, children }) {
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
