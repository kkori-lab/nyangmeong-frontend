import { generatePath } from 'react-router-dom';
import {
  GOOGLE_CLIENT_ID,
  IS_DEV,
  KAKAO_REST_KEY,
  NAVER_CLIENT_ID,
} from '@/api/env';
import { PATHS } from '@/routes/paths';

/** 인가 창에 넘긴 state·제공자·로그인 뒤 갈 곳·연동 모드. 콜백에서 한 번 읽고 지운다 */
const STORAGE_KEY = 'snsLoginRequest';

/** 제공자 코드(snsOffrCd, 서버 공통코드 USRG03) -> 인가 창, 콜백 경로의 provider */
const AUTHORIZE = {
  USRC0007: {
    provider: 'naver',
    url: 'https://nid.naver.com/oauth2.0/authorize',
    clientId: NAVER_CLIENT_ID,
  },
  USRC0008: {
    provider: 'kakao',
    url: 'https://kauth.kakao.com/oauth/authorize',
    clientId: KAKAO_REST_KEY,
  },
  USRC0009: {
    provider: 'google',
    url: 'https://accounts.google.com/o/oauth2/v2/auth',
    clientId: GOOGLE_CLIENT_ID,
    scope: 'openid email',
  },
};

/** 백엔드 app.sns.*.redirect-uri·제공자 콘솔과 같은 값이어야 한다. 콜백 경로도 로그인 화면이 받는다 */
const redirectUri = (snsOffrCd) =>
  `${window.location.origin}${generatePath(PATHS.SNS_CALLBACK, {
    provider: AUTHORIZE[snsOffrCd].provider,
  })}`;

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
 * - mode: 'link'면 로그인이 아니라 로그인한 회원에게 SNS 계정을 연동하는 요청이다
 */
export const startSnsLogin = ({ snsOffrCd, redirect, mode }) => {
  const { url, clientId, scope } = AUTHORIZE[snsOffrCd];
  const state = crypto.randomUUID();
  const params = new URLSearchParams({ state });

  if (clientId) {
    params.set('response_type', 'code');
    params.set('client_id', clientId);
    params.set('redirect_uri', redirectUri(snsOffrCd));
    if (scope) params.set('scope', scope);
  } else {
    const name = window.prompt('가짜 SNS 계정 이름(개발용)', 'snsuser');
    if (!name) return;
    params.set('code', `fake-${name.trim()}`);
  }

  sessionStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ state, snsOffrCd, redirect, mode }),
  );
  window.location.assign(
    clientId ? `${url}?${params}` : `${redirectUri(snsOffrCd)}?${params}`,
  );
};

/** 주소가 인가 창에서 돌아온 것인지(code 또는 error와 state가 있다) */
export const isSnsCallback = (searchParams) =>
  searchParams.has('state') &&
  (searchParams.has('code') || searchParams.has('error'));

/** 콜백 주소가 연동 요청에서 돌아온 것인지. 저장값은 지우지 않고 읽기만 한다(첫 그림부터 로그인 폼을 숨기는 데 쓴다) */
export const isSnsLinkCallback = (searchParams) =>
  isSnsCallback(searchParams) && readRequest()?.mode === 'link';

/**
 * 콜백 주소를 저장해 둔 요청과 맞춰 본다. 저장값은 맞든 틀리든 지운다(같은 state를 두 번 쓰지 않는다)
 * - { status: 'ok', snsOffrCd, code, state, redirect, mode }
 * - { status: 'cancelled', mode }: 사용자가 동의를 거절했거나 인증을 취소했다
 * - { status: 'mismatch', mode }: 저장한 state가 없거나 다르다(저장한 요청이 없으면 mode 없음)
 */
export const takeSnsCallback = (searchParams) => {
  const saved = readRequest();
  sessionStorage.removeItem(STORAGE_KEY);
  const state = searchParams.get('state');
  if (!saved) return { status: 'mismatch' };
  const { mode } = saved;
  if (saved.state !== state) return { status: 'mismatch', mode };
  if (!searchParams.get('code')) return { status: 'cancelled', mode };
  return {
    status: 'ok',
    snsOffrCd: saved.snsOffrCd,
    code: searchParams.get('code'),
    state,
    redirect: saved.redirect,
    mode,
  };
};
