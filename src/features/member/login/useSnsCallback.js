import { useEffect, useRef, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useSnsLogin } from '../queries';
import { LOGIN_MESSAGES as MSG } from './loginMessages';
import { isSnsCallback, takeSnsCallback } from './snsAuth';

// 서버 오류·네트워크 오류. 사용자가 고칠 수 없어 공통 실패 문구로 보인다
const SNS_FAILED_CODES = ['SERVER_ERROR', 'NETWORK_ERROR'];

/** 인가 창에서 돌아왔지만 요청하지 않은 결과 -> 안내 */
const CALLBACK_MESSAGES = {
  cancelled: MSG.snsCancelled,
  mismatch: MSG.snsMismatch,
};

/** 로그인 뒤 갈 곳(?redirect=)을 getLoginDestination이 읽는 검색 문자열로 */
const toSearch = (redirect) =>
  redirect ? `?${new URLSearchParams({ redirect })}` : '';

/**
 * 인가 창에서 /login?code=&state=로 돌아오면 state를 맞춰 본 뒤 SNS 로그인을 부른다
 * - 주소의 code·state는 바로 지운다. 결과는 snsLoginRslt별 콜백으로 넘긴다
 * - 실패·중복 안내는 notice로 로그인 방법 선택 위에 보인다
 */
export default function useSnsCallback({ onLogin, onSignup, onRecover }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const snsLogin = useSnsLogin();
  const [notice, setNotice] = useState(null);
  // 개발 모드에서 effect가 두 번 돌아도 한 번만 처리한다(저장한 state는 첫 처리에서 지워진다)
  const handled = useRef(false);
  const isCallback = isSnsCallback(searchParams);

  useEffect(() => {
    if (!isCallback || handled.current) return;
    handled.current = true;
    const result = takeSnsCallback(searchParams);
    // 취소·state 불일치는 주소를 지우며 이동 state로 남겨 안내한다
    setSearchParams(
      {},
      {
        replace: true,
        state: result.status === 'ok' ? null : { snsResult: result.status },
      },
    );
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
    isPending: isCallback || snsLogin.isPending,
    notice:
      notice ??
      (callbackMessage ? { type: 'error', message: callbackMessage } : null),
  };
}
