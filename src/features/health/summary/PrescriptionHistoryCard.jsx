import { Link } from 'react-router-dom';
import Badge from '@/components/Badge';
import Card from '@/components/Card';
import Icon from '@/components/Icon';
import { formatDate } from '@/utils/formatDate';
import { DOSING } from '../checkup/checkupTypes';
import { CardTitle, MoreLink, SummaryEmpty } from './SummaryParts';
import { DIARY_EXAM_PATH, getCheckupDetailPath } from './summaryUtils';

/**
 * [처방 및 투약 이력] (FN-HLT-011-08)
 * - 검진상세에 등록된 처방약을 복용 중 우선·최신순으로 표시, 행을 누르면 그 검진상세
 * - [전체 보기]는 첫 행 처방이 등록된 검진상세를 처방약 탭으로 엶
 */
export default function PrescriptionHistoryCard({ prescriptions }) {
  return (
    <Card
      title={<CardTitle icon="medication">처방 및 투약 이력</CardTitle>}
      action={
        prescriptions.length > 0 && (
          <MoreLink
            to={getCheckupDetailPath(prescriptions[0], 'prescription')}
          />
        )
      }
      bodyClassName="p-0!"
    >
      {prescriptions.length === 0 ? (
        <div className="px-[18px] pt-4 pb-[18px] sm:px-[22px] sm:pt-5 sm:pb-[22px]">
          <SummaryEmpty
            icon="medication"
            description="검진상세에서 처방약을 등록하면 여기에 모여요"
            action="건강 일지에서 검진기록 등록하기"
            to={DIARY_EXAM_PATH}
          />
        </div>
      ) : (
        <ul>
          {prescriptions.map((prescription) => {
            const isDosing = prescription.dosSttsCd === DOSING;
            return (
              <li key={prescription.rxSn} className="border-b border-line-soft last:border-b-0">
                <Link
                  to={getCheckupDetailPath(prescription)}
                  className="flex items-center gap-3.5 px-[18px] py-3.5 hover:bg-surface-2 sm:px-[22px]"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-[10px] border border-line bg-surface-2 text-ink-2">
                    <Icon name="medication" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="font-semibold">
                        {prescription.medNm}
                      </span>
                      <Badge tone={isDosing ? 'ok' : 'gray'}>
                        {isDosing ? '복용 중' : '복용 종료'}
                      </Badge>
                    </span>
                    <span className="block text-subtle tabular-nums">
                      {formatDate(prescription.dosBgnYmd)} ~{' '}
                      {isDosing ? '현재' : formatDate(prescription.dosEndYmd)} ·
                      1일 {prescription.dayDosCnt}회
                    </span>
                  </span>
                  <Icon name="chevron_right" className="text-[18px] text-subtle" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
