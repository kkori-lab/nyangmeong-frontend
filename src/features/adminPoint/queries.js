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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminPointKeys.lists });
      queryClient.invalidateQueries({ queryKey: adminPointKeys.balances });
    },
  });
};
