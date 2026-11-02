import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  appointAdmin,
  getAdminMember,
  getAdminMemberPets,
  getAdminMemberPoints,
  getAdminMembers,
  getAdminMemberStatusHistories,
  getAdminMemberTerms,
  getAdmins,
  getAdminSuspensions,
  getAdminWithdrawnMembers,
  releaseAdmin,
  releaseMember,
  suspendMember,
} from './api';

export const adminMemberKeys = {
  all: ['adminMember'],
  list: (params) => ['adminMember', 'list', params],
  suspensions: (params) => ['adminMember', 'suspensions', params],
  withdrawn: (params) => ['adminMember', 'withdrawn', params],
  admins: (params) => ['adminMember', 'admins', params],
  detail: (mbrSn) => ['adminMember', 'detail', mbrSn],
  pets: (params) => ['adminMember', 'pets', params],
  terms: (mbrSn) => ['adminMember', 'terms', mbrSn],
  points: (params) => ['adminMember', 'points', params],
  histories: (params) => ['adminMember', 'histories', params],
};

export const useAdminMembers = (params, { enabled = true } = {}) =>
  useQuery({
    queryKey: adminMemberKeys.list(params),
    queryFn: () => getAdminMembers(params),
    enabled,
    placeholderData: keepPreviousData,
  });

export const useAdminSuspensions = (params) =>
  useQuery({
    queryKey: adminMemberKeys.suspensions(params),
    queryFn: () => getAdminSuspensions(params),
    placeholderData: keepPreviousData,
  });

export const useAdminWithdrawnMembers = (params) =>
  useQuery({
    queryKey: adminMemberKeys.withdrawn(params),
    queryFn: () => getAdminWithdrawnMembers(params),
    placeholderData: keepPreviousData,
  });

export const useAdminMember = (mbrSn) =>
  useQuery({
    queryKey: adminMemberKeys.detail(mbrSn),
    queryFn: () => getAdminMember(mbrSn),
  });

export const useAdminMemberPets = (params) =>
  useQuery({
    queryKey: adminMemberKeys.pets(params),
    queryFn: () => getAdminMemberPets(params),
    placeholderData: keepPreviousData,
  });

export const useAdminMemberTerms = (mbrSn) =>
  useQuery({
    queryKey: adminMemberKeys.terms(mbrSn),
    queryFn: () => getAdminMemberTerms(mbrSn),
  });

export const useAdminMemberPoints = (params) =>
  useQuery({
    queryKey: adminMemberKeys.points(params),
    queryFn: () => getAdminMemberPoints(params),
    placeholderData: keepPreviousData,
  });

export const useAdminMemberStatusHistories = (params) =>
  useQuery({
    queryKey: adminMemberKeys.histories(params),
    queryFn: () => getAdminMemberStatusHistories(params),
    placeholderData: keepPreviousData,
  });

export const useSuspendMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: suspendMember,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: adminMemberKeys.all }),
  });
};

export const useReleaseMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: releaseMember,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: adminMemberKeys.all }),
  });
};

export const useAdmins = (params) =>
  useQuery({
    queryKey: adminMemberKeys.admins(params),
    queryFn: () => getAdmins(params),
    placeholderData: keepPreviousData,
  });

export const useAppointAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: appointAdmin,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: adminMemberKeys.all }),
  });
};

export const useReleaseAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: releaseAdmin,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: adminMemberKeys.all }),
  });
};
