import { api } from '@/api/axios';

/** 비로그인 401 랜딩 이동 반복 방지용 이동 끄기 */
export const getMe = () => api.get('/auth/me', { skipAuthRedirect: true });

export const logout = () => api.post('/auth/logout');

/**
 * [회원정보 수정 가짜 API]
 * - 회원 조회·수정 API(AIC) 전까지 사용 -> 나오면 본문만 api 요청으로 교체
 * - 미확정 키: acntEml·mbrNcnm·mbrTelno·prflImgUrl·snsTyCd·dplctYn·mbrJoinPathCd·mbrRegDt·mbrLastLgnDt
 * - 주소에 ?fake=sns 가 있으면 소셜 로그인 회원으로 간주
 * - 비밀번호에 wrong 을 넣으면 실패, 닉네임 초코맘2·관리자와 번호 01099998888은 중복,
 *   번호 01000000000은 조회 실패
 */
const FAKE_DELAY_MS = 200;
const DUP_NICKNAMES = ['초코맘2', '관리자'];
const DUP_PHONES = ['01099998888'];
const FAIL_PHONE = '01000000000';

const profile = {
  acntEml: 'chocomom@example.com',
  mbrNcnm: '초코맘',
  mbrTelno: '01012345678',
  prflImgUrl: null,
  mbrRegDt: '2026-08-14 09:12:00',
  mbrLastLgnDt: '2026-10-21 10:42:00',
};

const isFakeSns = () =>
  new URLSearchParams(window.location.search).get('fake') === 'sns';

const wait = (result) =>
  new Promise((resolve) => setTimeout(() => resolve(result), FAKE_DELAY_MS));

const fail = (code) =>
  wait().then(() => {
    throw Object.assign(new Error(code), { code });
  });

export const getMyProfile = () =>
  wait({
    ...profile,
    snsTyCd: isFakeSns() ? 'KAKAO' : null,
    mbrJoinPathCd: isFakeSns() ? 'KAKAO' : 'EMAIL',
  });

export const verifyPassword = ({ pswd }) =>
  pswd === 'wrong' ? fail('MISMATCH') : wait();

export const updateProfileImage = ({ file }) => {
  profile.prflImgUrl = file ? URL.createObjectURL(file) : null;
  return wait({ prflImgUrl: profile.prflImgUrl });
};

export const checkNickname = ({ mbrNcnm }) =>
  wait({ dplctYn: DUP_NICKNAMES.includes(mbrNcnm) });

export const updateNickname = ({ mbrNcnm }) => {
  if (DUP_NICKNAMES.includes(mbrNcnm)) return fail('DUPLICATE');
  profile.mbrNcnm = mbrNcnm;
  return wait();
};

export const checkPhone = ({ mbrTelno }) =>
  mbrTelno === FAIL_PHONE
    ? fail('FAILED')
    : wait({ dplctYn: DUP_PHONES.includes(mbrTelno) });

export const updatePhone = ({ mbrTelno }) => {
  if (DUP_PHONES.includes(mbrTelno)) return fail('DUPLICATE');
  profile.mbrTelno = mbrTelno;
  return wait();
};

export const updatePassword = ({ curPswd }) =>
  curPswd === 'wrong' ? fail('MISMATCH') : wait();

/** 실패 횟수·보안코드 요구 상태. 기록 없는 아이디도 false·0이라 가입 여부 비노출 */
export const getLoginStatus = ({ acntEml }) =>
  api.get('/auth/login-attempt-limits', {
    params: { email: acntEml },
    skipAuthRedirect: true,
  });

/** 보안코드 발급·새로고침. captchaImg는 PNG data URI이고 코드 원문은 미포함 */
export const getCaptcha = ({ acntEml }) =>
  api.post('/auth/captchas', { acntEml }, { skipAuthRedirect: true });

/**
 * 성공은 { ncnmReguide, mbrNcnm }, 실패는 code로 거부
 * - 정지 회원(MEMBER_INACTIVE)도 이 화면에서 안내하므로 랜딩 이동 해제
 */
export const login = ({ acntEml, pswd, scrtyCd }) =>
  api.post(
    '/auth/login',
    { acntEml, pswd, scrtyCd },
    { skipAuthRedirect: true },
  );

/**
 * [비밀번호 찾기·재설정 가짜 API]
 * - 인증·재설정 API(YAY 백엔드) 전까지 사용 -> 나오면 본문만 api 요청으로 교체
 * - 미확정 키: acntEml·authCd·expiresAt·snsTyCd·pswd, 인증 결과와 실패를 응답 본문으로 줄지 오류 응답으로 줄지
 * - 인증번호 123456은 일반 계정, 234567은 SNS 전용(카카오), 345678은 미가입, 456789는 탈퇴 계정, 그 외는 불일치
 * - 이메일 fail@example.com은 발송 실패, 새 비밀번호에 fail이 들어가면 저장 실패
 * - 유효시간 3분은 가짜에서만 사용(운영값 미확정). 본인확인 완료 상태는 새로고침하면 사라짐
 */
const RECOVERY_TTL_MS = 3 * 60 * 1000;
const RECOVERY_CODES = {
  123456: 'RESET',
  234567: 'SNS',
  345678: 'NOT_FOUND',
  456789: 'WITHDRAWN',
};

let recovery = { acntEml: '', expiresAt: 0, verified: false };

export const sendRecoveryCode = ({ acntEml }) => {
  if (acntEml === 'fail@example.com') return fail('SEND_FAILED');
  recovery = {
    acntEml,
    expiresAt: Date.now() + RECOVERY_TTL_MS,
    verified: false,
  };
  return wait({ expiresAt: recovery.expiresAt });
};

/** 결과는 RESET·SNS·NOT_FOUND·WITHDRAWN·MISMATCH·EXPIRED 중 하나 */
export const verifyRecoveryCode = ({ acntEml, authCd }) => {
  if (acntEml !== recovery.acntEml || Date.now() > recovery.expiresAt) {
    return wait({ result: 'EXPIRED' });
  }
  const result = RECOVERY_CODES[authCd] ?? 'MISMATCH';
  if (result === 'RESET') recovery.verified = true;
  return wait(result === 'SNS' ? { result, snsTyCd: 'KAKAO' } : { result });
};

export const getRecoveryStatus = () => wait({ verified: recovery.verified });

/** 성공이면 { ok: true }, 실패면 { ok: false, reason: 'EXPIRED' | 'FAILED' } */
export const resetPassword = ({ pswd }) => {
  if (!recovery.verified) return wait({ ok: false, reason: 'EXPIRED' });
  if (pswd.includes('fail')) return wait({ ok: false, reason: 'FAILED' });
  recovery = { acntEml: '', expiresAt: 0, verified: false };
  return wait({ ok: true });
};

/**
 * [회원가입 가짜 API]
 * - 가입·인증·중복확인 API(YAY 백엔드) 전까지 사용 -> 나오면 본문만 api 요청으로 교체
 * - 미확정 키: acntEml·authCd·expiresAt·mbrTelno·pswd·termsAgreeList·mbrNcnm, 중복·복구 대상 결과를 응답 본문으로 줄지 오류 응답으로 줄지
 * - 이메일 duplicate@example.com은 가입된 이메일, restore@example.com은 탈퇴 후 30일 이내 계정, fail@example.com은 발송 실패
 * - 인증번호 123456은 성공, 그 외는 불일치. 번호 01012345678은 중복, 01000000000은 조회 실패
 * - 비밀번호에 fail이 들어가면 가입 실패. 기본 닉네임은 가짜에서 고정값 제공
 * - 유효시간 3분은 가짜에서만 쓴다(운영값 미확정)
 */
const SIGNUP_CODE = '123456';
const SIGNUP_TTL_MS = 3 * 60 * 1000;
const SIGNUP_DUP_EMAIL = 'duplicate@example.com';
const SIGNUP_RESTORE_EMAIL = 'restore@example.com';
const SIGNUP_DUP_PHONE = '01012345678';

let signup = { acntEml: '', expiresAt: 0 };

/** 결과는 OK·DUPLICATE·RESTORE 중 하나. OK이면 expiresAt을 함께 제공 */
export const sendSignupCode = ({ acntEml }) => {
  if (acntEml === 'fail@example.com') return fail('SEND_FAILED');
  if (acntEml === SIGNUP_DUP_EMAIL) return wait({ result: 'DUPLICATE' });
  if (acntEml === SIGNUP_RESTORE_EMAIL) return wait({ result: 'RESTORE' });
  signup = { acntEml, expiresAt: Date.now() + SIGNUP_TTL_MS };
  return wait({ result: 'OK', expiresAt: signup.expiresAt });
};

/** 결과는 OK·MISMATCH·EXPIRED 중 하나 */
export const verifySignupCode = ({ acntEml, authCd }) => {
  if (acntEml !== signup.acntEml || Date.now() > signup.expiresAt) {
    return wait({ result: 'EXPIRED' });
  }
  return wait({ result: authCd === SIGNUP_CODE ? 'OK' : 'MISMATCH' });
};

export const checkSignupPhone = ({ mbrTelno }) =>
  mbrTelno === FAIL_PHONE
    ? fail('FAILED')
    : wait({ dplctYn: mbrTelno === SIGNUP_DUP_PHONE });

/** 성공이면 { ok: true, mbrNcnm }, 실패면 { ok: false, reason: 'FAILED' } */
export const joinMember = ({ pswd }) => {
  if (pswd.includes('fail')) return wait({ ok: false, reason: 'FAILED' });
  signup = { acntEml: '', expiresAt: 0 };
  return wait({ ok: true, mbrNcnm: '행복한집사4821' });
};
