import { useSearchParams } from 'react-router-dom';
import { showToast } from '@/components/toastStore';
import { LOGIN_MESSAGES as MSG } from './loginMessages';
import { canStartSnsLogin, startSnsLogin } from './snsAuth';
import { GoogleLogo, KakaoLogo, NaverLogo } from './SnsLogos';

const BASE =
  'relative flex h-12 w-full items-center justify-center rounded-xl px-12 font-semibold hover:brightness-[.97]';

const PROVIDERS = [
  {
    snsOffrCd: 'USRC0007',
    name: '네이버',
    Logo: NaverLogo,
    style: 'bg-[#03A94D] text-white',
  },
  {
    snsOffrCd: 'USRC0008',
    name: '카카오',
    Logo: KakaoLogo,
    style: 'bg-[#fee500] text-[#191600]',
  },
  {
    snsOffrCd: 'USRC0009',
    name: '구글',
    Logo: GoogleLogo,
    style: 'border border-input-line bg-white text-ink',
  },
];

// 누르면 제공자 인가 창으로 간다. 돌아오면 로그인 화면이 결과를 처리한다(useSnsCallback)
export default function SnsLoginButtons({ disabled }) {
  const [searchParams] = useSearchParams();

  const start = (snsOffrCd) => {
    if (!canStartSnsLogin(snsOffrCd)) {
      showToast(MSG.notReady);
      return;
    }
    startSnsLogin({ snsOffrCd, redirect: searchParams.get('redirect') });
  };

  return (
    <div className="flex flex-col gap-3">
      {PROVIDERS.map((provider) => {
        const Logo = provider.Logo;
        return (
          <button
            key={provider.snsOffrCd}
            type="button"
            disabled={disabled}
            onClick={() => start(provider.snsOffrCd)}
            className={`${BASE} ${provider.style} disabled:cursor-not-allowed disabled:opacity-60`}
          >
            <span className="absolute top-1/2 left-3 grid size-7 -translate-y-1/2 place-items-center">
              <Logo />
            </span>
            {provider.name}로 로그인하기
          </button>
        );
      })}
    </div>
  );
}
