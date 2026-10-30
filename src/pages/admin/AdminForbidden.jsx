import { Link } from 'react-router-dom';
import { BTN_PRIMARY } from '@/components/buttonStyles';
import { PATHS } from '@/routes/paths';

/**
 * [관리자 권한 오류]
 * - 관리자 API가 403을 주면 본문 자리에 표시 -> 서버 메시지가 있으면 그 문구
 */
export default function AdminForbidden({ message }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-2 rounded-[14px] border border-line bg-white px-6 py-16 text-center"
    >
      <p className="text-lg font-bold text-ink">
        {message || '관리자 권한이 없어요'}
      </p>
      <p className="text-base text-subtle">
        관리자 계정으로 다시 로그인해 주세요.
      </p>
      <Link to={PATHS.MAIN} className={`${BTN_PRIMARY} mt-4`}>
        메인으로
      </Link>
    </div>
  );
}
