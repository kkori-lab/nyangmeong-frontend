import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getAdminMembers } from './api';

export const adminMemberKeys = {
  all: ['adminMember'],
  list: (params) => ['adminMember', 'list', params],
};

export const useAdminMembers = (params) =>
  useQuery({
    queryKey: adminMemberKeys.list(params),
    queryFn: () => getAdminMembers(params),
    placeholderData: keepPreviousData,
  });
