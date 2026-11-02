import { useState } from 'react';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import Modal from '@/components/Modal';
import { showToast } from '@/components/toastStore';
import MemberSearch from './MemberSearch';
import { useAppointableMembers, useAppointAdmin } from './queries';

/**
 * [관리자 지정 모달]
 * - 회원 검색 -> 선택 -> 지정
 * - 실패하면 선택을 유지하고 서버 문구 표시
 */
export default function AppointAdminModal({ onClose }) {
  const [selected, setSelected] = useState(null);
  const appoint = useAppointAdmin();

  const handleAppoint = () =>
    appoint.mutate(selected.mbrSn, {
      onSuccess: () => {
        showToast('관리자로 지정했어요');
        onClose();
      },
    });

  return (
    <Modal
      title="관리자 지정"
      isTop
      isPending={appoint.isPending}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            className={BTN_SECONDARY}
            disabled={appoint.isPending}
            onClick={onClose}
          >
            취소
          </button>
          <button
            type="button"
            className={BTN_PRIMARY}
            disabled={!selected || appoint.isPending}
            onClick={handleAppoint}
          >
            지정
          </button>
        </>
      }
    >
      <p className="mb-1.5 text-sm font-semibold text-ink-2">회원</p>
      <MemberSearch
        selected={selected}
        onSelect={setSelected}
        useMembers={useAppointableMembers}
        placeholder="닉네임 또는 이메일 전체 주소"
        emptyText="지정할 수 있는 회원이 없어요"
      />
      {appoint.isError && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {appoint.error.message}
        </p>
      )}
    </Modal>
  );
}
