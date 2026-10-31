import { useState } from 'react';
import Badge from '@/components/Badge';
import Card from '@/components/Card';
import Icon from '@/components/Icon';
import { BTN_SECONDARY } from '@/components/buttonStyles';
import { formatDate } from '@/utils/formatDate';
import EmptyBox from '../diary/EmptyBox';
import PrescriptionForm from './PrescriptionForm';
import { ADD_ROW, ROW_LINE } from './checkupStyles';
import { DOSING } from './checkupTypes';

/**
 * [처방약 탭]
 * - 목록 행: 약품명(밑줄)·복용 기간·1일 복용 횟수·주기 체크·상태 뱃지, 약품명을 누르면 값이 채워진 수정 영역 (FN-HLT-005-03)
 * - 처방약이 0건이면 빈 상태 안내 + [＋ 처방약 추가]
 */
export default function PrescriptionTab({ petSn, ckupRcdSn, prescriptions }) {
  /** 입력 영역: null이면 닫힘, prescription이 null이면 새로 입력. token으로 같은 영역을 다른 행으로 다시 엶 */
  const [form, setForm] = useState(null);

  return (
    <Card title="처방약" sub="선택 입력">
      {prescriptions.length === 0 ? (
        <EmptyBox icon="medication" title="이 검진에서 받은 처방약이 없어요" />
      ) : (
        <ul>
          {prescriptions.map((prescription) => (
            <li
              key={prescription.rxSn}
              className={`flex items-center gap-3.5 py-3.5 ${ROW_LINE}`}
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-[10px] border border-line bg-surface-2 text-ink-2">
                <Icon name="medication" />
              </span>
              <span className="min-w-0 flex-1">
                <button
                  type="button"
                  className="text-left text-lg/[1.6] font-semibold text-ink underline underline-offset-4 hover:text-brand-600"
                  onClick={() => setForm({ prescription, token: Date.now() })}
                >
                  {prescription.medNm}
                </button>
                <span className="block text-subtle tabular-nums">
                  {formatDate(prescription.dosBgnYmd)} ~{' '}
                  {formatDate(prescription.dosEndYmd)} · 1일{' '}
                  {prescription.dayDosCnt}회 · 주기 체크{' '}
                  {prescription.cycleChckYn ? 'ON' : 'OFF'}
                </span>
              </span>
              <Badge tone={prescription.dosSttsCd === DOSING ? 'ok' : 'gray'}>
                {prescription.dosSttsCd === DOSING ? '복용중' : '종료'}
              </Badge>
            </li>
          ))}
        </ul>
      )}

      {form === null && (
        <button
          type="button"
          className={`${BTN_SECONDARY} ${ADD_ROW} w-full`}
          onClick={() => setForm({ prescription: null, token: Date.now() })}
        >
          <Icon name="add" className="text-lg" />
          처방약 추가
        </button>
      )}
      {form && (
        <PrescriptionForm
          key={form.token}
          petSn={petSn}
          ckupRcdSn={ckupRcdSn}
          prescription={form.prescription}
          onClose={() => setForm(null)}
        />
      )}
    </Card>
  );
}
