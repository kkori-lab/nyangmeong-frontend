import { canStartSnsLogin, startSnsLogin } from '../login/snsAuth';
import { GoogleLogo, KakaoLogo, NaverLogo } from '../login/SnsLogos';
import { ROW_BTN } from '../shared/profileStyles';
import { SNS_NAME } from '../shared/snsCodes';
import AccountRow from './AccountRow';

/**
 * 표시 순서와 로고. 로그인 버튼용 로고라 네이버(흰색)·카카오(글자색)는 브랜드 색 바탕 위에 올린다.
 * 바탕은 모두 20px 정사각형이라 세 줄의 크기가 같다
 */
const PROVIDERS = [
  {
    snsOffrCd: 'USRC0007',
    Logo: NaverLogo,
    chip: 'bg-[#03A94D] [&>svg]:size-3',
  },
  {
    snsOffrCd: 'USRC0008',
    Logo: KakaoLogo,
    chip: 'bg-[#fee500] text-[#191600] [&>svg]:size-4',
  },
  { snsOffrCd: 'USRC0009', Logo: GoogleLogo, chip: '[&>svg]:size-5' },
];

/**
 * 제공자별 연동 상태. 가입할 때 쓴 제공자는 "가입 계정", 이미 연동한 제공자는 "연동됨", 나머지는 [연동하기].
 * [연동하기]는 인가 창으로 가고, 돌아오면 로그인 화면 주소가 결과를 처리한다(useSnsCallback, mode: 'link'). 해제는 없다
 */
export default function SnsLinkCard({ joinPathCd, snsAcntLinks = [] }) {
  const linked = new Set(snsAcntLinks.map(({ snsOffrCd }) => snsOffrCd));

  return (
    <>
      {PROVIDERS.map((provider) => {
        const { snsOffrCd, chip } = provider;
        const Logo = provider.Logo;
        const isJoined = snsOffrCd === joinPathCd;
        const isLinked = !isJoined && linked.has(snsOffrCd);
        return (
          <AccountRow
            key={snsOffrCd}
            label={
              <span className="inline-flex items-center gap-2">
                <span
                  className={`inline-flex size-5 shrink-0 items-center justify-center rounded-xs ${chip}`}
                >
                  <Logo />
                </span>
                {SNS_NAME[snsOffrCd]}
              </span>
            }
            value={
              isJoined ? (
                '가입 계정'
              ) : isLinked ? (
                '연동됨'
              ) : (
                <span className="text-subtle">연동 안 됨</span>
              )
            }
            action={
              !isJoined &&
              !isLinked && (
                <button
                  type="button"
                  className={`${ROW_BTN} disabled:cursor-not-allowed disabled:opacity-50`}
                  disabled={!canStartSnsLogin(snsOffrCd)}
                  onClick={() => startSnsLogin({ snsOffrCd, mode: 'link' })}
                >
                  연동하기
                </button>
              )
            }
          />
        );
      })}
    </>
  );
}
