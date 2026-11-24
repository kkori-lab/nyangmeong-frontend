import { Link, Outlet, useLocation, useSearchParams } from 'react-router-dom';
import sideImage from '@/assets/auth_side.jpg';
import logo_white from '@/assets/logo-white.svg';
import logo from '@/assets/nm_logo.svg';
import { PATHS } from '@/routes/paths';

const PANEL_COPY = {
  login: {
    title: ['소중한 가족을 위한', '똑똑한 하루 관리'],
    desc: '건강 기록부터 일정 알림까지 한곳에서 세심하게 챙겨주세요.',
  },
  signup: {
    title: ['새로운 케어 노트를', '만들어보세요'],
    desc: '반려동물의 건강한 삶을 위한 완벽한 첫걸음입니다.',
  },
};

export default function AuthLayout() {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const isSignup = pathname === PATHS.SIGNUP;
  // 입력칸이 있는 화면은 넓은 칸으로 맞춘다(이메일 로그인과 비밀번호 찾기·재설정의 입력칸 너비가 같게)
  const isWide =
    isSignup ||
    pathname === PATHS.PASSWORD_FIND ||
    pathname === PATHS.PASSWORD_RESET ||
    (pathname === PATHS.LOGIN && searchParams.get('method') === 'email');
  const isSlider = isSignup || pathname === PATHS.LOGIN;
  const copy = isSignup ? PANEL_COPY.signup : PANEL_COPY.login;

  return (
    <div className="flex min-h-dvh items-center justify-center bg-page-bg p-4 max-[760px]:items-start max-[760px]:p-0 min-[1100px]:p-5">
      <main
        className={`grid w-full max-w-270 min-[760px]:h-150 overflow-hidden rounded-4xl bg-white shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-[grid-template-columns] duration-800 ease-[cubic-bezier(0.25,1,0.5,1)] max-[760px]:min-h-dvh max-[760px]:grid-cols-1 max-[760px]:rounded-none max-[760px]:shadow-none ${
          isWide
            ? 'grid-cols-[0.7fr_1.5fr] min-[1100px]:grid-cols-[1.1fr_1.5fr]'
            : 'grid-cols-[1fr_1.1fr] min-[1100px]:grid-cols-[1.6fr_1fr]'
        }`}
      >
        <section className="relative flex min-w-0 flex-col justify-between overflow-hidden bg-brand-900 px-8 py-9 text-white max-[760px]:hidden min-[1100px]:px-11 min-[1100px]:py-12.5">
          <img
            src={sideImage}
            alt=""
            className="pointer-events-none absolute inset-0 size-full object-cover"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-linear-to-t from-brand-900/75 via-brand-900/10 to-brand-900/45"
          />
          <Link to={PATHS.HOME} className="relative block w-fit rounded-xl">
            <img
              src={logo_white}
              alt="냥멍케어"
              className="block h-8 w-[121px]"
            />
          </Link>
          <div
            key={isSignup ? 'signup' : 'login'}
            className="relative transition duration-500 starting:translate-y-2.5 starting:opacity-0"
          >
            <h1 className="mb-3 text-2xl leading-[1.3] font-bold min-[1100px]:text-[32px]">
              {copy.title[0]}
              <br />
              {copy.title[1]}
            </h1>
            <p className="text-[15px] leading-[1.6] opacity-85">{copy.desc}</p>
          </div>
        </section>
        <section className="flex min-h-0 min-w-0 flex-col">
          <Link to={PATHS.HOME} className="hidden px-4 pt-6 max-[760px]:block">
            <img src={logo} alt="냥멍케어" className="h-8 w-auto" />
          </Link>
          <div
            className={`flex min-h-0 min-w-0 flex-1 flex-col justify-center-safe ${
              isSlider
                ? ''
                : 'overflow-y-auto px-8 py-8 max-[760px]:px-4 max-[760px]:py-6 min-[1100px]:px-12.5'
            }`}
          >
            <Outlet />
          </div>
        </section>
      </main>
    </div>
  );
}
