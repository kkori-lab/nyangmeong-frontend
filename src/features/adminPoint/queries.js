import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  adjustAdminPoint,
  getAdminPointBalance,
  getAdminPointLedgers,
  getAdminPointMember,
  getPointDealTypes,
  searchAdminPointMembers,
} from './api';
import { adminMemberKeys } from '@/features/adminMember/queries';

export const adminPointKeys = {
  all: ['adminPoint'],
  lists: ['adminPoint', 'list'],
  list: (params) => ['adminPoint', 'list', params],
  dealTypes: ['adminPoint', 'dealTypes'],
  member: (mbrSn) => ['adminPoint', 'member', mbrSn],
  members: (q) => ['adminPoint', 'members', q],
  balances: ['adminPoint', 'balance'],
  balance: (mbrSn) => ['adminPoint', 'balance', mbrSn],
};

export const useAdminPointLedgers = (params) =>
  useQuery({
    queryKey: adminPointKeys.list(params),
    queryFn: () => getAdminPointLedgers(params),
    placeholderData: keepPreviousData,
  });

/** 거래 유형은 SQL로만 바뀌어 오래 둔다 */
export const usePointDealTypes = () =>
  useQuery({
    queryKey: adminPointKeys.dealTypes,
    queryFn: getPointDealTypes,
    staleTime: Infinity,
  });

/** mbrSn이 없으면 부르지 않는다 */
export const useAdminPointMember = (mbrSn) =>
  useQuery({
    queryKey: adminPointKeys.member(mbrSn),
    queryFn: () => getAdminPointMember(mbrSn),
    enabled: Boolean(mbrSn),
  });

/** 검색어가 없으면 부르지 않는다 */
export const useAdminPointMemberSearch = (q) =>
  useQuery({
    queryKey: adminPointKeys.members(q),
    queryFn: () => searchAdminPointMembers(q),
    enabled: Boolean(q),
  });

export const useAdminPointBalance = (mbrSn) =>
  useQuery({
    queryKey: adminPointKeys.balance(mbrSn),
    queryFn: () => getAdminPointBalance(mbrSn),
    enabled: Boolean(mbrSn),
  });

export const useAdjustAdminPoint = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adjustAdminPoint,
    onSuccess: (_data, { mbrSn }) => {
      queryClient.invalidateQueries({ queryKey: adminPointKeys.lists });
      queryClient.invalidateQueries({ queryKey: adminPointKeys.balances });
      queryClient.invalidateQueries({ queryKey: adminPointKeys.member(mbrSn) });
      // 회원 상세의 보유 포인트·포인트 탭도 바뀐다
      queryClient.invalidateQueries({
        queryKey: adminMemberKeys.detail(mbrSn),
      });
      // params 중 mbrSn만 맞으면 쪽 번호와 상관없이 무효화된다(부분 일치)
      queryClient.invalidateQueries({
        queryKey: adminMemberKeys.points({ mbrSn }),
      });
    },
  });
};
