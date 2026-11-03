import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  createAdminNotificationTemplate,
  getAdminNotificationTemplates,
  getNotificationChannels,
  getNotificationTypes,
  updateAdminNotificationTemplate,
} from './api';

export const adminNotificationTemplateKeys = {
  all: ['adminNotificationTemplate'],
  lists: ['adminNotificationTemplate', 'list'],
  list: (params) => ['adminNotificationTemplate', 'list', params],
  types: ['adminNotificationTemplate', 'types'],
  channels: ['adminNotificationTemplate', 'channels'],
};

export const useAdminNotificationTemplates = (params) =>
  useQuery({
    queryKey: adminNotificationTemplateKeys.list(params),
    queryFn: () => getAdminNotificationTemplates(params),
    placeholderData: keepPreviousData,
  });

/** 유형·채널은 SQL로만 바뀌어 오래 둔다 */
export const useNotificationTypes = () =>
  useQuery({
    queryKey: adminNotificationTemplateKeys.types,
    queryFn: getNotificationTypes,
    staleTime: Infinity,
  });

export const useNotificationChannels = () =>
  useQuery({
    queryKey: adminNotificationTemplateKeys.channels,
    queryFn: getNotificationChannels,
    staleTime: Infinity,
  });

const useInvalidateTemplates = () => {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({
      queryKey: adminNotificationTemplateKeys.lists,
    });
};

export const useCreateAdminNotificationTemplate = () => {
  const invalidate = useInvalidateTemplates();
  return useMutation({
    mutationFn: createAdminNotificationTemplate,
    onSuccess: invalidate,
  });
};

export const useUpdateAdminNotificationTemplate = () => {
  const invalidate = useInvalidateTemplates();
  return useMutation({
    mutationFn: updateAdminNotificationTemplate,
    onSuccess: invalidate,
  });
};
