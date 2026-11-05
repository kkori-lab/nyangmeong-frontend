import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  checkNicknameAvailability,
  checkPhoneAvailability,
  getCaptcha,
  getLoginStatus,
  getMe,
  getMyProfile,
  getRecoveryInfo,
  getTerms,
  getTermsList,
  invalidateRecoveryCode,
  joinMember,
  joinSnsMember,
  login,
  logout,
  recoverMember,
  resetPassword,
  sendMemberRecoveryCode,
  sendRecoveryCode,
  sendSignupCode,
  setupNickname,
  snsLogin,
  updatePassword,
  updatePhone,
  updateProfileImage,
  verifyPassword,
  verifyRecoveryCode,
  verifySignupCode,
  withdrawMember,
} from './api';

export const memberKeys = {
  me: ['members', 'me'],
  profile: ['members', 'profile'],
  termsList: ['terms'],
  terms: (trmsSn) => ['terms', trmsSn],
};

export const useMe = () =>
  useQuery({
    queryKey: memberKeys.me,
    queryFn: getMe,
    staleTime: 5 * 60 * 1000,
  });

/** /auth/me 응답이 회원 요약과 같아 useMe와 같은 요청·캐시 사용 */
export const useMemberSummary = useMe;

/** 로그인 직후 회원 정보: 이전 캐시를 쓰지 않고 새로 조회 */
export const useFetchMe = () => {
  const queryClient = useQueryClient();
  return () =>
    queryClient.query({
      queryKey: memberKeys.me,
      queryFn: getMe,
      staleTime: 0,
    });
};

export const useLogout = () => useMutation({ mutationFn: logout });

export const useMyProfile = () =>
  useQuery({ queryKey: memberKeys.profile, queryFn: getMyProfile });

export const useVerifyPassword = () =>
  useMutation({ mutationFn: verifyPassword });

export const useUpdateProfileImage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateProfileImage,
    onSuccess: () => qc.invalidateQueries({ queryKey: memberKeys.profile }),
  });
};

export const useUpdatePhone = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updatePhone,
    onSuccess: () => qc.invalidateQueries({ queryKey: memberKeys.profile }),
  });
};

export const useUpdatePassword = () =>
  useMutation({ mutationFn: updatePassword });

/** 로그인하면 쿠키가 바뀌므로 내 정보(헤더) 재조회 */
export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: login,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: memberKeys.me }),
  });
};

/** 로그인 결과일 때 쿠키가 바뀌므로 내 정보(헤더) 재조회 */
export const useSnsLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: snsLogin,
    onSuccess: ({ snsLoginRslt }) => {
      if (snsLoginRslt === 'LOGIN') {
        queryClient.invalidateQueries({ queryKey: memberKeys.me });
      }
    },
  });
};

export const useLoginStatus = () => useMutation({ mutationFn: getLoginStatus });

export const useNewCaptcha = () => useMutation({ mutationFn: getCaptcha });

export const useSendRecoveryCode = () =>
  useMutation({ mutationFn: sendRecoveryCode });

export const useVerifyRecoveryCode = () =>
  useMutation({ mutationFn: verifyRecoveryCode });

export const useInvalidateRecoveryCode = () =>
  useMutation({ mutationFn: invalidateRecoveryCode });

export const useSendMemberRecoveryCode = () =>
  useMutation({ mutationFn: sendMemberRecoveryCode });

export const useRecoveryInfo = () =>
  useMutation({ mutationFn: getRecoveryInfo });

export const useRecoverMember = () =>
  useMutation({ mutationFn: recoverMember });

export const useCheckPhoneAvailability = () =>
  useMutation({ mutationFn: checkPhoneAvailability });

export const useTermsList = () =>
  useQuery({ queryKey: memberKeys.termsList, queryFn: getTermsList });

export const useTerms = (trmsSn) =>
  useQuery({
    queryKey: memberKeys.terms(trmsSn),
    queryFn: () => getTerms(trmsSn),
  });

export const useResetPassword = () =>
  useMutation({ mutationFn: resetPassword });

export const useSendSignupCode = () =>
  useMutation({ mutationFn: sendSignupCode });

export const useVerifySignupCode = () =>
  useMutation({ mutationFn: verifySignupCode });

export const useJoinMember = () => useMutation({ mutationFn: joinMember });

export const useJoinSnsMember = () =>
  useMutation({ mutationFn: joinSnsMember });

export const useCheckNicknameAvailability = () =>
  useMutation({ mutationFn: checkNicknameAvailability });

export const useSetupNickname = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: setupNickname,
    onSuccess: () => qc.invalidateQueries({ queryKey: memberKeys.me }),
  });
};

export const useWithdrawMember = () =>
  useMutation({ mutationFn: withdrawMember });
