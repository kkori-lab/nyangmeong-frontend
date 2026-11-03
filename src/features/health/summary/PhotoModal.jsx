import Modal from '@/components/Modal';
import { BTN_PRIMARY } from '@/components/buttonStyles';

/** 사진 원본 미리보기 (관찰 기록·첨부 자료 공용). 비공개 파일은 src 대신 그림 요소를 children으로 넘긴다 */
export default function PhotoModal({ src, children, onClose }) {
  return (
    <Modal
      title="사진 원본"
      onClose={onClose}
      footer={
        <button type="button" className={BTN_PRIMARY} onClick={onClose}>
          닫기
        </button>
      }
    >
      {children ?? <img src={src} alt="" className="w-full rounded-[10px]" />}
    </Modal>
  );
}
