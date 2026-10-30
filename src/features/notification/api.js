import { api } from '@/api/axios';

export const getUnreadCount = () => api.get('/notifications/unread-count');

/** tab: ALL·CARE·COMMUNITY·INFO (최신순 5건, 7일 경과 숨김은 서버) */
export const getNotifications = ({ tab }) =>
  api.get('/notifications', { params: { tab } });

export const readNotification = (inappNotiSn) =>
  api.post(`/notifications/${inappNotiSn}/read`);

export const getNotificationSettings = () =>
  api.get('/members/me/notification-settings');

export const saveNotificationSettings = (body) =>
  api.put('/members/me/notification-settings', body);
