import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  getAdminMembers,
  getAdminSuspensions,
  getAdminWithdrawnMembers,
  releaseMember,
  suspendMember,
} from './api';

export const adminMemberKeys = {
  all: ['adminMember'],
  list: (params) => ['adminMember', 'list', params],
  suspensions: (params) => ['adminMember', 'suspensions', params],
  withdrawn: (params) => ['adminMember', 'withdrawn', params],
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
