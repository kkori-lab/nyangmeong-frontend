import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Outlet } from 'react-router-dom';
import { subscribeAiWrite } from '@/utils/aiWriteChannel';
import UserHeader from './UserHeader';

export default function PlaceLayout() {
  const queryClient = useQueryClient();
  /** AI 대화창(별도 창)에서 즐겨찾기를 저장·해제하면 다시 불러온다(UserLayout과 같음) */
  useEffect(
    () => subscribeAiWrite(() => queryClient.invalidateQueries()),
    [queryClient],
  );

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-white">
      <UserHeader />
      <main className="min-h-0 flex-1">
        <Outlet />
      </main>
    </div>
  );
}
