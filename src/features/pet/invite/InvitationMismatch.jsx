import { Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import { PATHS } from '@/routes/paths';

/**
 * [초대 이메일 불일치 안내]
 * - 로그인한 계정의 이메일이 초대받은 이메일과 다를 때 수락 화면 대신 보인다 (FN-MYP-005-09)
 * - [초대받은 계정으로 로그인]: 로그아웃과 이동은 상위(pages)가 onLogin으로 전달
 * - 앱(≤760px)은 두 버튼을 세로로 쌓고 로그인 버튼이 위
 */
export default function InvitationMismatch({
  invtEmlMskd,
  onLogin,
  isPending,
}) {
  return (
    <section
      aria-labelledby="mismatch-title"
      className="mx-auto w-full max-w-[560px] overflow-hidden rounded-card border border-line bg-white shadow-depth-sm"
    >
      <div className="flex flex-col items-center gap-3 px-8 pt-10 pb-7 text-center">
        <span className="mb-2 grid size-[72px] place-items-center rounded-full bg-brand-50 text-brand-600">
          <Mail className="size-9" aria-hidden="true" />
        </span>
        <h2 id="mismatch-title" className="text-lg font-bold break-keep">
          이 초대는 {invtEmlMskd}으로 보낸 초대예요
        </h2>
        <p className="text-subtle break-keep">
          초대받은 이메일 계정으로 로그인해 주세요.
          <br />
          지금 계정으로 받으려면 초대한 분께 다시 초대를 요청해 주세요.
        </p>
      </div>
      <div className="flex items-center justify-end gap-2 border-t border-line bg-[#fbfcfd] px-7 py-4 max-[760px]:flex-col-reverse max-[760px]:items-stretch max-[760px]:px-5">
        <Link
          to={PATHS.MYPAGE}
          className={`${BTN_SECONDARY} max-[760px]:h-11 max-[760px]:w-full`}
        >
          마이페이지 홈으로
        </Link>
        <button
          type="button"
          onClick={onLogin}
          disabled={isPending}
          className={`${BTN_PRIMARY} max-[760px]:h-11 max-[760px]:w-full`}
        >
          초대받은 계정으로 로그인
        </button>
      </div>
    </section>
  );
}
