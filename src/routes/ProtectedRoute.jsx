import { Navigate, Outlet, useLocation } from 'react-router-dom';
import PageLoading from '@/components/PageLoading';
import { useMe } from '@/features/member/queries';
import { toLoginPath } from '@/utils/loginRedirect';
import { getRoleHome } from './redirect';

/** 화면 진입 차단 편의 장치(권한 판정은 서버) */
export default function ProtectedRoute({ allowedRoles }) {
  const { data: me, isPending, isError } = useMe();
  const { pathname, search } = useLocation();

  if (isPending) return <PageLoading />;
  /** Navigate는 아무것도 그리지 않아 이동한 화면 코드를 읽는 동안 흰 화면이 되므로 로딩 동시 표시 */
  if (isError) {
    return (
      <>
        <PageLoading />
        <Navigate to={toLoginPath(pathname, search)} replace />
      </>
    );
  }
  if (allowedRoles && !allowedRoles.includes(me.mbrAuthrtCd)) {
    return (
      <>
        <PageLoading />
        <Navigate to={getRoleHome(me.mbrAuthrtCd)} replace />
      </>
    );
  }
  return <Outlet />;
}
