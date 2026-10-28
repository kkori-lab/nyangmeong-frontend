import { PATHS } from '@/routes/paths';

/**
 * 미인증 접근을 보낼 로그인 주소(복귀 파라미터 redirect 보존)
 * - 랜딩·로그인에서는 새 redirect를 만들지 않고 지금 주소의 redirect를 넘긴다(중첩 방지)
 */
export function toLoginPath(pathname, search = '') {
  const isEntry = pathname === PATHS.HOME || pathname === PATHS.LOGIN;
  const target = isEntry
    ? new URLSearchParams(search).get('redirect')
    : pathname + search;
  return target
    ? `${PATHS.LOGIN}?redirect=${encodeURIComponent(target)}`
    : PATHS.LOGIN;
}
