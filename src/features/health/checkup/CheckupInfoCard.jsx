import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/Card';
import Modal from '@/components/Modal';
import { BTN_DANGER, BTN_SECONDARY } from '@/components/buttonStyles';
import { PATHS } from '@/routes/paths';
import { formatDate } from '@/utils/formatDate';
import CareItemMenu from '../CareItemMenu';
import CareShortageNotice from '../CareShortageNotice';
import CheckupModal from '../diary/CheckupModal';
import { useDeleteCheckup } from '../queries';
import { CHECKUP_TYPES } from '../scheduleTypes';
import { findName } from './checkupTypes';

/**
 * [검진상세 기본정보 카드]
 * - 검진일·병원명·검진 종류·검진 내용·검진 메모, 탭 위에 고정 (FN-HLT-005-01)
 * - 제목줄 오른쪽 ⋮ 메뉴(CareItemMenu): [수정]은 검진기록 수정 모달을 바로 열고, [삭제]는 확인창을 거쳐 지움 (※신규 정책)
 * - 검진기록 삭제는 여기서만 한다. 지우면 건강 일지 검진기록 탭으로 이동(뒤로 가기로 지운 상세에 안 돌아가게 replace).
 *   검진상세는 선택 반려동물을 정하는 곳 밖이라 ?petSn=으로 이 기록의 반려동물을 알려 준다
 */
export default function CheckupInfoCard({ checkup, pets }) {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const deleteCheckup = useDeleteCheckup();
  const typeNm = findName(CHECKUP_TYPES, checkup.ckupTypeCd);

  const handleDelete = () =>
    deleteCheckup.mutate(
      { petSn: checkup.petSn, ckupRcdSn: checkup.ckupRcdSn },
      {
        onSuccess: () =>
          navigate(`${PATHS.HEALTH_DIARY}?petSn=${checkup.petSn}#hlt002-exam`, {
            replace: true,
          }),
      },
    );

  return (
    <Card
      title="기본정보"
      action={
        <CareItemMenu
          label="검진기록 메뉴"
          onEdit={() => setIsModalOpen(true)}
          onDelete={() => setIsDeleteOpen(true)}
        />
      }
    >
      <dl>
        <Row label="검진일">
          <span className="tabular-nums">{formatDate(checkup.ckupYmd)}</span>
        </Row>
        <Row label="동물병원명">{checkup.hsptlNm}</Row>
        <Row label="검진 종류">{typeNm}</Row>
        <Row label="검진 내용">{checkup.ckupCn}</Row>
        <Row label="검진 메모">
          <span className="text-muted">{checkup.ckupMemoCn}</span>
        </Row>
      </dl>

      {isModalOpen && (
        <CheckupModal
          pets={pets}
          defaultPetSn={checkup.petSn}
          checkup={checkup}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {isDeleteOpen && (
        <Modal
          isConfirm
          title="검진기록을 삭제할까요?"
          description="이 검진의 투약·반복 예방 항목도 케어리스트에서 삭제됩니다(완료 기록은 유지)"
          isPending={deleteCheckup.isPending}
          onClose={() => setIsDeleteOpen(false)}
          footer={
            <>
              <button
                type="button"
                className={BTN_SECONDARY}
                disabled={deleteCheckup.isPending}
                onClick={() => setIsDeleteOpen(false)}
              >
                취소
              </button>
              <button
                type="button"
                className={BTN_DANGER}
                disabled={deleteCheckup.isPending}
                onClick={handleDelete}
              >
                삭제하기
              </button>
            </>
          }
        >
          {/** 지우면 케어리스트가 5개 미만이 될 때만 안내 (※신규 정책) */}
          <CareShortageNotice
            petSn={checkup.petSn}
            isTarget={(item) => item.ckupRcdSn === checkup.ckupRcdSn}
          />
        </Modal>
      )}
    </Card>
  );
}

/** 라벨·값 한 줄 */
function Row({ label, htmlFor, children }) {
  return (
    <div className="flex items-start gap-3 border-t border-dashed border-line py-2.5 first:border-t-0 max-[760px]:flex-col max-[760px]:gap-1">
      <dt className="w-[104px] shrink-0 text-subtle">
        {htmlFor ? <label htmlFor={htmlFor}>{label}</label> : label}
      </dt>
      <dd className="min-w-0 flex-1 break-words text-ink">{children}</dd>
    </div>
  );
}
