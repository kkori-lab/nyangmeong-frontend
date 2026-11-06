import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { showToast } from '@/components/toastStore';
import { PATHS } from '@/routes/paths';
import { useLinkSns, useSnsLogin } from '../queries';
import { LOGIN_MESSAGES as MSG } from './loginMessages';
import { isSnsCallback, isSnsLinkCallback, takeSnsCallback } from './snsAuth';

// 서버 오류·네트워크 오류. 사용자가 고칠 수 없어 공통 실패 문구로 보인다
const SNS_FAILED_CODES = ['SERVER_ERROR', 'NETWORK_ERROR'];

/** 인가 창에서 돌아왔지만 요청하지 않은 결과 -> 안내 */
const CALLBACK_MESSAGES = {
  cancelled: MSG.snsCancelled,
  mismatch: MSG.snsMismatch,
};

/** 연동 모드에서 돌아온 결과가 연동 요청이 아닐 때 -> 회원정보 화면의 토스트 */
const LINK_CALLBACK_MESSAGES = {
  cancelled: MSG.snsLinkCancelled,
  mismatch: MSG.snsLinkMismatch,
};

/** 로그인 뒤 갈 곳(?redirect=)을 getLoginDestination이 읽는 검색 문자열로 */
const toSearch = (redirect) =>
  redirect ? `?${new URLSearchParams({ redirect })}` : '';

/**
 * 인가 창에서 콜백 주소로 돌아오면 state를 맞춰 본 뒤 SNS 로그인을 부른다
 * - 콜백 주소(/login/sns/:provider/callback)는 바로 /login으로 바꾼다. 결과는 snsLoginRslt별 콜백으로 넘긴다
 * - 실패·중복 안내는 notice로 로그인 방법 선택 위에 보인다
 * - 연동 모드(mode: 'link', 회원정보의 [연동하기])는 sns-login 대신 sns-links를 부르고 결과를 토스트로 알리며 회원정보로 돌아간다.
 *   끝날 때까지 isLinking이 true라 로그인 화면은 폼 대신 로딩만 그린다
 */
export default function useSnsCallback({ onLogin, onSignup, onRecover }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const snsLogin = useSnsLogin();
  const linkSns = useLinkSns();
  // 저장한 요청은 처리하면서 지워지므로 첫 그림에서 한 번만 읽어 둔다
  const [isLinking] = useState(() => isSnsLinkCallback(searchParams));
  const [notice, setNotice] = useState(null);
  // 개발 모드에서 effect가 두 번 돌아도 한 번만 처리한다(저장한 state는 첫 처리에서 지워진다)
  const handled = useRef(false);
  const isCallback = isSnsCallback(searchParams);

  useEffect(() => {
    if (!isCallback || handled.current) return;
    handled.current = true;
    const result = takeSnsCallback(searchParams);
    if (result.mode === 'link') {
      const backToProfile = (message) => {
        navigate(PATHS.MYPAGE_PROFILE, { replace: true });
        showToast(message);
      };
      if (result.status !== 'ok') {
        backToProfile(LINK_CALLBACK_MESSAGES[result.status]);
        return;
      }
      const { snsOffrCd, code, state } = result;
      linkSns.mutate(
        { snsOffrCd, code, state },
        {
          onSuccess: () => backToProfile(MSG.snsLinked),
          onError: (error) =>
            backToProfile(
              SNS_FAILED_CODES.includes(error.code)
                ? MSG.snsLinkFailed
                : error.message,
            ),
        },
      );
      return;
    }
    // 콜백 주소를 /login(+?redirect=)으로 바꿔 기록에 남기지 않는다. 취소·state 불일치는 이동 state로 남겨 안내한다
    navigate(`${PATHS.LOGIN}${toSearch(result.redirect)}`, {
      replace: true,
      state: result.status === 'ok' ? null : { snsResult: result.status },
    });
    if (result.status !== 'ok') return;

    const { snsOffrCd, code, state, redirect } = result;
    snsLogin.mutate(
      { snsOffrCd, code, state },
      {
        onSuccess: (data) => {
          if (data.snsLoginRslt === 'LOGIN') {
            onLogin(data, toSearch(redirect));
          } else if (data.snsLoginRslt === 'SIGNUP_REQUIRED') {
            onSignup(data);
          } else if (data.snsLoginRslt === 'RECOVERY_AVAILABLE') {
            onRecover(data.acntEml);
          } else {
            setNotice({ type: 'error', message: MSG.snsEmailDuplicate });
          }
        },
        onError: (error) =>
          setNotice({
            type: 'error',
            message: SNS_FAILED_CODES.includes(error.code)
              ? MSG.snsFailed
              : error.message,
          }),
      },
    );
    // 콜백 주소로 들어온 처음 한 번만 처리한다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCallback]);

  const callbackMessage = CALLBACK_MESSAGES[location.state?.snsResult];

  return {
    isLinking,
    isPending: isCallback || snsLogin.isPending,
    notice:
      notice ??
      (callbackMessage ? { type: 'error', message: callbackMessage } : null),
  };
}
