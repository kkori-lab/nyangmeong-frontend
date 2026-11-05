import { api } from '@/api/axios';

/** 비로그인 401 랜딩 이동 반복 방지용 이동 끄기 */
export const getMe = () => api.get('/auth/me', { skipAuthRedirect: true });

export const logout = () => api.post('/auth/logout');

/** 응답 { acntEml, mbrNcnm, mblTelno, atchFileSn, joinPathCd, snsAcntLinks, joinDt, lastLgnDt } */
export const getMyProfile = () => api.get('/members/me');

/** 본인 확인. 틀리면 CURRENT_PASSWORD_MISMATCH, SNS 전용 회원은 SNS_ONLY_MEMBER */
export const verifyPassword = ({ pswd }) =>
  api.post('/members/me/password-verification', { pswd });

/**
 * 프로필 사진 변경: multipart. file이 있으면 profilePhoto, 없으면 기본 이미지(profilePhotoReset)
 * 오류: FILE_TYPE_NOT_ALLOWED · FILE_TOO_LARGE
 */
export const updateProfileImage = ({ file }) => {
  const form = new FormData();
  if (file) form.append('profilePhoto', file);
  else form.append('profilePhotoReset', 'true');
  return api.patch('/members/me', form);
};

/** 휴대폰 번호 변경: multipart. 오류: PHONE_ALREADY_USED · INVALID_PHONE_NUMBER */
export const updatePhone = ({ mblTelno }) => {
  const form = new FormData();
  form.append('mblTelno', mblTelno);
  return api.patch('/members/me', form);
};

/** 오류: CURRENT_PASSWORD_MISMATCH · PASSWORD_MISMATCH · INVALID_INPUT_VALUE(fields에 pswd) */
export const updatePassword = ({ currentPswd, pswd, pswdCnfrm }) =>
  api.patch('/members/me/password', { currentPswd, pswd, pswdCnfrm });

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

/**
 * SNS 로그인. snsLoginRslt로 갈린다
 * - LOGIN { ncnmReguide, mbrNcnm }: 로그인 쿠키가 심긴다
 * - SIGNUP_REQUIRED { snsOffrCd, acntEml, mblTelno, ageCnfrmd, signupTkn }: SNS 가입 확인으로
 * - EMAIL_DUPLICATE·RECOVERY_AVAILABLE { acntEml }
 * - 오류: SNS_AUTH_FAILED · SNS_EMAIL_NOT_PROVIDED · MEMBER_INACTIVE(이 화면에서 안내하므로 이동 끔)
 */
export const snsLogin = ({ snsOffrCd, code, state }) =>
  api.post(
    '/auth/sns-login',
    { snsOffrCd, code, state },
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
 * 재가입 복구(탈퇴 후 보관 기간 안의 회원) API. 로그인 전에 부르는 요청이라 모두 skipAuthRedirect.
 * 인증번호 확인(verifyRecoveryCode)·무효화(invalidateRecoveryCode)는 목적과 상관없이 같은 엔드포인트를 쓴다
 */
const MEMBER_RECOVERY_PURPOSE = 'USRC0012';

/** 복구 인증번호 발송·재전송. 응답·오류는 비밀번호 찾기와 같다 */
export const sendMemberRecoveryCode = ({ certTrgtEml }) =>
  api.post(
    '/email-certifications',
    { emlCertPrpsCd: MEMBER_RECOVERY_PURPOSE, certTrgtEml },
    { skipAuthRedirect: true },
  );

/** 복구 안내. 응답 { acntEml, mbrNcnm, whdwlDt, rcvryExpryDt, maskedMblTelno, missingTrms } */
export const getRecoveryInfo = ({ emlCertSn, rcvryAuthrtTkn }) =>
  api.post(
    '/members/recovery-info',
    { emlCertSn, rcvryAuthrtTkn },
    { skipAuthRedirect: true },
  );

/** 복구 실행. 성공해도 로그인 쿠키는 만들어지지 않는다 */
export const recoverMember = ({
  emlCertSn,
  rcvryAuthrtTkn,
  trmsAgres,
  mblTelno,
}) =>
  api.post(
    '/members/recovery',
    { emlCertSn, rcvryAuthrtTkn, trmsAgres, mblTelno },
    { skipAuthRedirect: true },
  );

/** 휴대전화번호 정규화·중복확인(가입·복구 공용). 응답 { normalizedMblTelno, available } */
export const checkPhoneAvailability = ({ mblTelno }) =>
  api.get('/members/phone-availability', {
    params: { mblTelno },
    skipAuthRedirect: true,
  });

/** 사용 중인 약관 목록(가입 약관 동의). 응답 [{ trmsSn, trmsFixIdntfKey, trmsTtl, esntlAgreYn, sortSeq }] */
export const getTermsList = () => api.get('/terms', { skipAuthRedirect: true });

/** 약관 전문 */
export const getTerms = (trmsSn) =>
  api.get(`/terms/${trmsSn}`, { skipAuthRedirect: true });

/**
 * 비밀번호 재설정. 성공 200은 데이터 없음(자동 로그인 없음, 그 계정의 기존 로그인은 모두 종료).
 * 실패: 400 PASSWORD_RESET_NOT_AVAILABLE(만료·사용 완료·무효화), PASSWORD_MISMATCH, INVALID_INPUT_VALUE(error.fields)
 */
export const resetPassword = ({ emlCertSn, pswdInitTkn, pswd, pswdCnfrm }) =>
  api.post(
    `/email-certifications/${emlCertSn}/password-reset`,
    { pswdInitTkn, pswd, pswdCnfrm },
    { skipAuthRedirect: true },
  );

/** 이메일 인증번호 목적 코드(공통코드 USRG04): 회원가입 */
const SIGNUP_PURPOSE = 'USRC0010';

/** 가입 인증번호 발송·재전송. 응답·오류는 비밀번호 찾기와 같고, 이미 가입은 409 EMAIL_ALREADY_REGISTERED, 탈퇴 보관 이메일은 409 MEMBER_RECOVERY_AVAILABLE */
export const sendSignupCode = ({ certTrgtEml }) =>
  api.post(
    '/email-certifications',
    { emlCertPrpsCd: SIGNUP_PURPOSE, certTrgtEml },
    { skipAuthRedirect: true },
  );

/** 가입 이메일 인증 확인. 성공이면 certRslt가 SIGNUP_READY */
export const verifySignupCode = verifyRecoveryCode;

/** 이메일 가입 */
const JOIN_PATH_EMAIL = 'USRC0006';

/** 가입. 응답 { mbrNcnm, … }, 닉네임 설정용 쿠키(ncnm_setup)가 심기고 로그인은 되지 않는다 */
export const joinMember = ({
  emlCertSn,
  certNo,
  mblTelno,
  pswd,
  trmsAgres,
  idmptDmndId,
}) =>
  api.post(
    '/members',
    {
      joinPathCd: JOIN_PATH_EMAIL,
      emlCertSn,
      certNo,
      mblTelno,
      pswd,
      pswdCnfrm: pswd,
      trmsAgres,
      idmptDmndId,
    },
    { skipAuthRedirect: true },
  );

/**
 * SNS 가입. 가입경로는 제공자 코드, 비밀번호·이메일 인증 없이 signupTkn으로 가입한다
 * 응답·쿠키는 이메일 가입과 같다. 오류: SNS_SIGNUP_TOKEN_INVALID(만료) · SNS_ACCOUNT_ALREADY_LINKED · PHONE_ALREADY_USED
 */
export const joinSnsMember = ({
  snsOffrCd,
  signupTkn,
  mblTelno,
  trmsAgres,
  idmptDmndId,
}) =>
  api.post(
    '/members',
    { joinPathCd: snsOffrCd, signupTkn, mblTelno, trmsAgres, idmptDmndId },
    { skipAuthRedirect: true },
  );

/** 닉네임 형식·중복 확인. 응답 { available } */
export const checkNicknameAvailability = ({ mbrNcnm }) =>
  api.get('/members/nickname-availability', {
    params: { mbrNcnm },
    skipAuthRedirect: true,
  });

/** 가입 직후(ncnm_setup 쿠키)나 로그인 뒤 닉네임 확정. 기본 닉네임을 그대로 둘 때도 보낸다 */
export const setupNickname = ({ mbrNcnm }) =>
  api.patch('/members/me/nickname', { mbrNcnm }, { skipAuthRedirect: true });

/**
 * 회원탈퇴. 문구는 입력 그대로(trim 하지 않음) 보낸다.
 * 응답이 오지 않으면 결과를 확인해야 하므로 시간 제한을 둔다(timeout은 NETWORK_ERROR로 온다)
 */
export const withdrawMember = ({ confirmPhrase }) =>
  api.post(
    '/members/me/withdraw',
    { noticeConfirmed: true, confirmPhrase },
    { timeout: 15000 },
  );
