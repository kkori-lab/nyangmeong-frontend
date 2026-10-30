// 로그인(왼쪽)·가입(오른쪽) 폼을 나란히 두고 isSignup에 따라 좌우로 민다.
// 보이지 않는 쪽은 inert로 두어 키보드가 들어가지 않게 하고, 760px 이하에서는 보이는 쪽만 그린다.
// 높이는 겉틀이 정한 값을 따르고, 내용이 더 길면 그 폼 안에서 스크롤한다(단계가 바뀌어도 카드 크기는 그대로다)
// 가운데 정렬은 justify-center-safe로 해서 내용이 길어져도 위쪽(제목)이 잘리지 않는다
const PANE =
  'flex h-full w-1/2 flex-col overflow-y-auto px-8 py-8 max-md:h-auto max-md:w-full max-md:px-4 max-md:py-6 lg:px-12.5';

export default function AuthSlider({ isSignup, login, signup }) {
  return (
    <div className="min-h-0 w-full min-w-0 flex-1 overflow-hidden">
      <div
        className={`flex h-full w-[200%] transition-transform duration-700 ease-out max-md:w-full max-md:transition-none ${
          isSignup ? '-translate-x-1/2 max-md:translate-x-0' : ''
        }`}
      >
        <div
          inert={isSignup}
          className={`${PANE} justify-center-safe ${isSignup ? 'max-md:hidden' : ''}`}
        >
          {login}
        </div>
        <div
          inert={!isSignup}
          className={`${PANE} justify-start ${isSignup ? '' : 'max-md:hidden'}`}
        >
          {signup}
        </div>
      </div>
    </div>
  );
}
