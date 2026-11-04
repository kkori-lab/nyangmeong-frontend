import {
  GOOGLE_CLIENT_ID,
  IS_DEV,
  KAKAO_REST_KEY,
  NAVER_CLIENT_ID,
} from '@/api/env';
import { PATHS } from '@/routes/paths';

/** 인가 창에 넘긴 state·제공자·로그인 뒤 갈 곳. 콜백에서 한 번 읽고 지운다 */
const STORAGE_KEY = 'snsLoginRequest';

/** 제공자 코드(snsOffrCd, 서버 공통코드 USRG03) -> 인가 창 */
const AUTHORIZE = {
  USRC0007: {
    url: 'https://nid.naver.com/oauth2.0/authorize',
    clientId: NAVER_CLIENT_ID,
  },
  USRC0008: {
    url: 'https://kauth.kakao.com/oauth/authorize',
    clientId: KAKAO_REST_KEY,
  },
  USRC0009: {
    url: 'https://accounts.google.com/o/oauth2/v2/auth',
    clientId: GOOGLE_CLIENT_ID,
    scope: 'openid email',
  },
};

/** 백엔드 redirect-uri와 같은 값이어야 한다. 콜백은 로그인 화면이 받는다 */
const redirectUri = () => `${window.location.origin}${PATHS.LOGIN}`;

const readRequest = () => {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
};

/** 인가 창을 열 수 있는지. 앱 ID가 없어도 개발 서버에서는 가짜 제공자로 열린다 */
export const canStartSnsLogin = (snsOffrCd) =>
  Boolean(AUTHORIZE[snsOffrCd].clientId) || IS_DEV;

/**
 * state를 만들어 두고 제공자 인가 창으로 간다
 * - 앱 ID가 없는 개발 서버: 인가 창 대신 이름을 받아 fake-이름 코드로 바로 돌아온다(백엔드 app.sns.client=fake)
 * - 이름 입력을 취소하면 아무것도 하지 않는다
 */
export const startSnsLogin = ({ snsOffrCd, redirect }) => {
  const { url, clientId, scope } = AUTHORIZE[snsOffrCd];
  const state = crypto.randomUUID();
  const params = new URLSearchParams({ state });

  if (clientId) {
    params.set('response_type', 'code');
    params.set('client_id', clientId);
    params.set('redirect_uri', redirectUri());
    if (scope) params.set('scope', scope);
  } else {
    const name = window.prompt('가짜 SNS 계정 이름(개발용)', 'snsuser');
    if (!name) return;
    params.set('code', `fake-${name.trim()}`);
  }

  sessionStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ state, snsOffrCd, redirect }),
  );
  window.location.assign(
    clientId ? `${url}?${params}` : `${redirectUri()}?${params}`,
  );
};

/** 주소가 인가 창에서 돌아온 것인지(code 또는 error와 state가 있다) */
export const isSnsCallback = (searchParams) =>
  searchParams.has('state') &&
  (searchParams.has('code') || searchParams.has('error'));

/**
 * 콜백 주소를 저장해 둔 요청과 맞춰 본다. 저장값은 맞든 틀리든 지운다(같은 state를 두 번 쓰지 않는다)
 * - { status: 'ok', snsOffrCd, code, state, redirect }
 * - { status: 'cancelled' }: 사용자가 동의를 거절했거나 인증을 취소했다
 * - { status: 'mismatch' }: 저장한 state가 없거나 다르다
 */
export const takeSnsCallback = (searchParams) => {
  const saved = readRequest();
  sessionStorage.removeItem(STORAGE_KEY);
  const state = searchParams.get('state');
  if (!saved || saved.state !== state) return { status: 'mismatch' };
  if (!searchParams.get('code')) return { status: 'cancelled' };
  return {
    status: 'ok',
    snsOffrCd: saved.snsOffrCd,
    code: searchParams.get('code'),
    state,
    redirect: saved.redirect,
  };
};
