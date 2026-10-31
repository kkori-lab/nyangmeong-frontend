import { useState } from 'react';
import Card from '@/components/Card';
import Icon from '@/components/Icon';
import { BTN_PRIMARY, BTN_SECONDARY } from '@/components/buttonStyles';
import { formatDate } from '@/utils/formatDate';
import { useUpdateCheckup } from '../queries';
import CheckupModal from '../diary/CheckupModal';
import { INPUT_CLASS, TEXTAREA_CLASS } from '../diary/formStyles';
import { CHECKUP_TYPES } from '../scheduleTypes';
import { BTN_SM, TEXT_BTN } from './checkupStyles';
import { findName } from './checkupTypes';

const MAX_CONTENT_LENGTH = 500;
const MAX_MEMO_LENGTH = 200;

/**
 * [검진상세 기본정보 카드]
 * - 검진일·병원명·검진 종류·검진 내용·검진 메모, 탭 위에 고정 (FN-HLT-005-01)
 * - [수정]은 같은 자리에서 검진 내용·메모만 수정. 검진일·병원명·검진 종류는 비활성 + [검진기록 수정] 링크로 모달 수정
 * - 모달로 저장하면 같은 자리 수정을 닫아 모달에서 고친 값이 옛 초안으로 덮이지 않게 함
 */
export default function CheckupInfoCard({ checkup, pets }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ckupCn, setCkupCn] = useState('');
  const [ckupMemoCn, setCkupMemoCn] = useState('');
  const updateCheckup = useUpdateCheckup();
  const typeNm = findName(CHECKUP_TYPES, checkup.ckupTypeCd);

  const startEdit = () => {
    setCkupCn(checkup.ckupCn ?? '');
    setCkupMemoCn(checkup.ckupMemoCn ?? '');
    setIsEditing(true);
  };

  /** 서버는 보낸 필드만 바꾼다 */
  const handleSubmit = (event) => {
    event.preventDefault();
    updateCheckup.mutate(
      {
        petSn: checkup.petSn,
        ckupRcdSn: checkup.ckupRcdSn,
        body: { ckupCn: ckupCn.trim(), ckupMemoCn: ckupMemoCn.trim() },
      },
      { onSuccess: () => setIsEditing(false) },
    );
  };

  return (
    <Card
      title="기본정보"
      action={
        !isEditing && (
          <button
            type="button"
            className={`${BTN_SECONDARY} ${BTN_SM}`}
            onClick={startEdit}
          >
            <Icon name="edit" className="text-lg" />
            수정
          </button>
        )
      }
    >
      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <dl>
            <Row label="검진일" htmlFor="info-ckup-ymd">
              <input
                id="info-ckup-ymd"
                value={formatDate(checkup.ckupYmd)}
                disabled
                className={`${INPUT_CLASS} tabular-nums`}
              />
            </Row>
            <Row label="동물병원명" htmlFor="info-hosp-nm">
              <input
                id="info-hosp-nm"
                value={checkup.hsptlNm}
                disabled
                className={INPUT_CLASS}
              />
            </Row>
            <Row label="검진 종류" htmlFor="info-ckup-type">
              <div className="flex flex-wrap items-center gap-3">
                <input
                  id="info-ckup-type"
                  value={typeNm}
                  disabled
                  className={`${INPUT_CLASS} max-w-60`}
                />
                <button
                  type="button"
                  className={TEXT_BTN}
                  onClick={() => setIsModalOpen(true)}
                >
                  검진기록 수정
                  <Icon name="chevron_right" className="text-lg" />
                </button>
              </div>
            </Row>
            <Row label="검진 내용" htmlFor="info-ckup-cn">
              <textarea
                id="info-ckup-cn"
                value={ckupCn}
                maxLength={MAX_CONTENT_LENGTH}
                className={TEXTAREA_CLASS}
                onChange={(event) => setCkupCn(event.target.value)}
              />
            </Row>
            <Row label="검진 메모" htmlFor="info-ckup-memo">
              <input
                id="info-ckup-memo"
                value={ckupMemoCn}
                maxLength={MAX_MEMO_LENGTH}
                className={INPUT_CLASS}
                onChange={(event) => setCkupMemoCn(event.target.value)}
              />
            </Row>
          </dl>
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              className={BTN_SECONDARY}
              disabled={updateCheckup.isPending}
              onClick={() => setIsEditing(false)}
            >
              취소
            </button>
            <button
              type="submit"
              className={BTN_PRIMARY}
              disabled={updateCheckup.isPending}
            >
              저장하기
            </button>
          </div>
        </form>
      ) : (
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
      )}

      {isModalOpen && (
        <CheckupModal
          pets={pets}
          defaultPetSn={checkup.petSn}
          checkup={checkup}
          onSaved={() => setIsEditing(false)}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </Card>
  );
}

/** 라벨·값 한 줄 */
function Row({ label, htmlFor, children }) {
  return (
    <div className="flex items-start gap-3 border-t border-dashed border-line py-2.5 first:border-t-0 max-sm:flex-col max-sm:gap-1">
      <dt className="w-[104px] shrink-0 text-subtle">
        {htmlFor ? <label htmlFor={htmlFor}>{label}</label> : label}
      </dt>
      <dd className="min-w-0 flex-1 break-words text-ink">{children}</dd>
    </div>
  );
}
