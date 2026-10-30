import PageSkeleton from './PageSkeleton';

/** [화면 전체 로딩] 로그인 확인·화면 코드 읽는 동안 흰 화면 대신 표시 */
export default function PageLoading() {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-[1200px] px-4 py-8">
      <PageSkeleton />
    </div>
  );
}
