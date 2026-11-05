import { CircleCheck } from 'lucide-react';
import AuthHeading from '../shared/AuthHeading';
import { PRIMARY_BTN } from '../shared/authStyles';

/** 회원탈퇴 완료 1~2 */
export default function WithdrawComplete({ onGoLanding }) {
  return (
    <section className="w-full">
      <CircleCheck className="mb-4 size-12 text-brand-500" />
      <AuthHeading
        title="회원탈퇴가 완료되었습니다."
        subtitle="지금까지 이용해 주셔서 감사합니다."
      />
      <ul className="mb-8 list-disc space-y-1 pl-5 text-sm leading-6 text-ink-2">
        <li>
          탈퇴 후 30일 이내 같은 이메일로 본인확인 후 재가입하면 기존 정보를
          복구할 수 있습니다.
        </li>
        <li>네이버·카카오·구글 자체 계정은 삭제되지 않습니다.</li>
      </ul>
      <button type="button" onClick={onGoLanding} className={PRIMARY_BTN}>
        랜딩페이지로
      </button>
    </section>
  );
}
