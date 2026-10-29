import { api } from '@/api/axios';

/** 비로그인 401 랜딩 이동 반복 방지용 이동 끄기 */
export const getMe = () => api.get('/auth/me', { skipAuthRedirect: true });

export const logout = () => api.post('/auth/logout');

/**
 * [회원정보 수정 가짜 API]
 * - 회원 조회·수정 API(AIC) 전까지 사용 -> 나오면 본문만 api 요청으로 교체
 * - 미확정 키: acntEml·mbrNcnm·mbrTelno·prflImgUrl·snsTyCd·dplctYn·mbrJoinPathCd·mbrRegDt·mbrLastLgnDt
 * - 주소에 ?fake=sns 가 있으면 소셜 로그인 회원으로 처리
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
    snsTyCd: isFakeSns() ? 'USRC0008' : null,
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

/** 보안코드 발급·새로고침. captchaImg는 PNG data URI, 코드 원문은 응답에 없음 */
export const getCaptcha = ({ acntEml }) =>
  api.post('/auth/captchas', { acntEml }, { skipAuthRedirect: true });

/**
 * 성공은 { ncnmReguide, mbrNcnm }, 실패는 code로 거부
 * - 정지 회원(MEMBER_INACTIVE)도 이 화면에서 안내하므로 랜딩 이동 끔
 */
export const login = ({ acntEml, pswd, scrtyCd }) =>
  api.post(
    '/auth/login',
    { acntEml, pswd, scrtyCd },
    { skipAuthRedirect: true },
  );

/** 이메일 인증번호 목적 코드(공통코드 USRG04): 비밀번호 찾기 */
const PASSWORD_RESET_PURPOSE = 'USRC0011';

/** 인증번호 발송·재전송. 응답 { emlCertSn, certExpryDt }, 재전송 제한은 EMAIL_CERT_RESEND_NOT_YET(error.data.resendAvailableDt) */
export const sendRecoveryCode = ({ certTrgtEml }) =>
  api.post(
    '/email-certifications',
    { emlCertPrpsCd: PASSWORD_RESET_PURPOSE, certTrgtEml },
    { skipAuthRedirect: true },
  );

/** 인증번호 확인. 응답의 certRslt로 재설정 대상·SNS 전용·미가입·탈퇴 보관 구분 */
export const verifyRecoveryCode = ({ emlCertSn, certNo }) =>
  api.post(
    `/email-certifications/${emlCertSn}/verify`,
    { certNo },
    { skipAuthRedirect: true },
  );

/** 인증번호·재설정 권한 무효화(이메일을 다시 입력할 때) */
export const invalidateRecoveryCode = ({ emlCertSn, certTrgtEml }) =>
  api.post(
    `/email-certifications/${emlCertSn}/invalidate`,
    { certTrgtEml },
    { skipAuthRedirect: true },
  );

/**
 * [비밀번호 재설정 가짜 API]
 * - 재설정 API(`POST /email-certifications/{emlCertSn}/password-reset`, YAY 백엔드 SCR-ACC-012) 전까지 사용 -> 나오면 본문만 api 요청으로 교체
 * - 새 비밀번호에 fail이 들어가면 저장 실패
 * - 본인확인(`pswdInitTkn`) 여부는 호출 전에 PasswordResetPage가 판단
 */
/** 성공이면 { ok: true }, 실패면 { ok: false, reason: 'EXPIRED' | 'FAILED' } */
export const resetPassword = ({ pswd }) =>
  wait(pswd.includes('fail') ? { ok: false, reason: 'FAILED' } : { ok: true });

/**
 * [회원가입 가짜 API]
 * - 가입·인증·중복확인 API(YAY 백엔드) 전까지 사용 -> 나오면 본문만 api 요청으로 교체
 * - 미확정 키: acntEml·authCd·expiresAt·mbrTelno·pswd·termsAgreeList·mbrNcnm, 중복·복구 대상 결과를 응답 본문으로 줄지 오류 응답으로 줄지
 * - 이메일 duplicate@example.com은 가입된 이메일, restore@example.com은 탈퇴 후 30일 이내 계정, fail@example.com은 발송 실패
 * - 인증번호 123456은 성공, 그 외는 불일치. 번호 01012345678은 중복, 01000000000은 조회 실패
 * - 비밀번호에 fail이 들어가면 가입 실패. 기본 닉네임은 가짜에서 고정값
 * - 유효시간 3분은 가짜에서만 쓴다(운영값 미확정)
 */
const SIGNUP_CODE = '123456';
const SIGNUP_TTL_MS = 3 * 60 * 1000;
const SIGNUP_DUP_EMAIL = 'duplicate@example.com';
const SIGNUP_RESTORE_EMAIL = 'restore@example.com';
const SIGNUP_DUP_PHONE = '01012345678';

let signup = { acntEml: '', expiresAt: 0 };

/** 결과는 OK·DUPLICATE·RESTORE 중 하나. OK이면 expiresAt도 포함 */
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
