import { useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import PageLoading from '@/components/PageLoading';
import StepMotion from '@/components/StepMotion';
import EmailLoginForm from '@/features/member/login/EmailLoginForm';
import LoginMethodChoice from '@/features/member/login/LoginMethodChoice';
import useSnsCallback from '@/features/member/login/useSnsCallback';
import NicknameModal from '@/features/member/signup/NicknameModal';
import { PATHS } from '@/routes/paths';
import { getLoginDestination } from '@/routes/redirect';
import { useFetchMe } from '@/features/member/queries';

export default function LoginPage() {
  const navigate = useNavigate();
  const fetchMe = useFetchMe();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const isEmail = searchParams.get('method') === 'email';
  // 이메일 로그인으로 들어가면 forward, 방법 선택으로 돌아오면 back (전환 모션의 방향)
  const [prevIsEmail, setPrevIsEmail] = useState(isEmail);
  const [direction, setDirection] = useState('forward');
  /** 가입 후 첫 로그인인데 닉네임 설정이 안 끝났으면 서버가 준 닉네임으로 모달 표시. search는 모달 뒤 갈 곳 */
  const [reguide, setReguide] = useState(null);
  if (prevIsEmail !== isEmail) {
    setPrevIsEmail(isEmail);
    setDirection(isEmail ? 'forward' : 'back');
  }

  const selectEmail = () =>
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('method', 'email');
      return next;
    });

  const backToChoice = () => {
    if (location.key !== 'default') {
      navigate(-1);
      return;
    }
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('method');
        return next;
      },
      { replace: true },
    );
  };

  const goAfterLogin = async (search = location.search) => {
    let mbrAuthrtCd;
    try {
      ({ mbrAuthrtCd } = await fetchMe());
    } catch {
      /** 역할 조회 실패: 회원 기준 이동 */
    }
    navigate(getLoginDestination(mbrAuthrtCd, search), {
      replace: true,
    });
  };

  /** search: SNS 로그인은 인가 창을 다녀오며 주소가 바뀌어 저장해 둔 ?redirect=를 넘긴다 */
  const finishLogin = ({ ncnmReguide, mbrNcnm }, search = location.search) => {
    if (ncnmReguide) {
      setReguide({ mbrNcnm, search });
      return;
    }
    goAfterLogin(search);
  };

  const sns = useSnsCallback({
    onLogin: finishLogin,
    onSignup: ({ snsOffrCd, acntEml, mblTelno, ageCnfrmd, signupTkn }) =>
      navigate(PATHS.SIGNUP, {
        replace: true,
        state: {
          snsSignup: { snsOffrCd, acntEml, mblTelno, ageCnfrmd, signupTkn },
        },
      }),
    onRecover: (recoveryEmail) =>
      navigate(PATHS.SIGNUP, { replace: true, state: { recoveryEmail } }),
  });

  // 회원정보에서 시작한 SNS 연동을 처리하는 동안 로그인한 사람에게 로그인 폼을 보이지 않는다
  if (sns.isLinking) return <PageLoading />;

  return (
    <>
      <StepMotion stepKey={isEmail ? 'email' : 'choice'} direction={direction}>
        {isEmail ? (
          <EmailLoginForm
            onBack={backToChoice}
            onSuccess={(result) => finishLogin(result)}
            onSignup={() => navigate(PATHS.SIGNUP)}
          />
        ) : (
          <LoginMethodChoice
            onBack={() => navigate(PATHS.HOME)}
            onSelectEmail={selectEmail}
            onSignup={() => navigate(PATHS.SIGNUP)}
            isJoined={searchParams.get('joined') === '1'}
            snsNotice={sns.notice}
            isSnsPending={sns.isPending}
          />
        )}
      </StepMotion>
      {reguide && (
        <NicknameModal
          savedNickname={reguide.mbrNcnm}
          onSaved={() => goAfterLogin(reguide.search)}
          onClose={() => goAfterLogin(reguide.search)}
        />
      )}
    </>
  );
}
