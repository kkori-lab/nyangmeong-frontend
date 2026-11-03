import { useState } from 'react';
import { BTN_SECONDARY } from '@/components/buttonStyles';
import FileImage from '@/components/FileImage';
import Modal from '@/components/Modal';
import Skeleton from '@/components/Skeleton';
import { formatDateTime } from '@/utils/formatDate';
import { publicFileUrl } from '@/utils/fileUrl';
import {
  formatCost,
  getMtchStatusLabel,
  getOwnerCfmtnLabel,
  getRcrtStatusLabel,
} from './careMatchLabels';
import { useAdminCareRecruit } from './queries';

/** 라벨·값 한 줄 */
function InfoRow({ label, children }) {
  return (
    <div className="grid grid-cols-[112px_1fr] gap-3 border-b border-line px-4 py-3 text-base last:border-b-0 max-[760px]:grid-cols-[88px_1fr]">
      <dt className="text-subtle">{label}</dt>
      <dd className="min-w-0 break-words text-ink-2">{children}</dd>
    </div>
  );
}

/** 상태 이력: 시각·바뀐 상태·사유 */
function StatusHistory({ history }) {
  if (history.length === 0) return '—';
  return (
    <ol className="space-y-1">
      {history.map((item) => (
        <li key={item.regDt + item.aftrSttsCd} className="leading-[1.5]">
          <span className="text-subtle tabular-nums">
            {formatDateTime(item.regDt)}
          </span>{' '}
          {getMtchStatusLabel(item.aftrSttsCd)}
          {item.chgRsn && (
            <span className="text-subtle"> · 사유: {item.chgRsn}</span>
          )}
        </li>
      ))}
    </ol>
  );
}

/** 매칭 한 건 */
function MatchInfo({ match }) {
  return (
    <dl className="rounded-[14px] border border-line bg-white">
      <InfoRow label="돌봄이">{match.ctptNcnm}</InfoRow>
      <InfoRow label="거래 상태">
        {getMtchStatusLabel(match.mtchDlngSttsCd)}
      </InfoRow>
      <InfoRow label="합의 조건">
        {match.agreVerNo != null ? (
          <>
            <span className="tabular-nums">
              {match.agreVerNo}차 합의 · {formatDateTime(match.agreDt)}
            </span>
            {match.agreCn && (
              <p className="mt-1 leading-[1.5] text-subtle">{match.agreCn}</p>
            )}
          </>
        ) : (
          '—'
        )}
      </InfoRow>
      <InfoRow label="상태 이력">
        <StatusHistory history={match.sttsHstry} />
      </InfoRow>
      <InfoRow label="완료 요청">
        {match.cmplReqDt ? (
          <span className="tabular-nums">
            {formatDateTime(match.cmplReqDt)}
          </span>
        ) : (
          '—'
        )}
        {match.cmplImgs.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {match.cmplImgs.map(({ atchFileSn }, index) => (
              <FileImage
                key={atchFileSn}
                src={publicFileUrl(atchFileSn)}
                alt={`완료 사진 ${index + 1}`}
                className="size-24 rounded-[8px] object-cover"
              />
            ))}
          </div>
        )}
      </InfoRow>
      <InfoRow label="보호자 확인">
        {getOwnerCfmtnLabel(match.ownerCfmtnRsltCd)}
        {match.ownerCfmtnDt && (
          <span className="text-subtle tabular-nums">
            {' '}
            · {formatDateTime(match.ownerCfmtnDt)}
          </span>
        )}
      </InfoRow>
    </dl>
  );
}

/** 매칭이 여럿이면 탭으로 나눈다 */
function MatchTabs({ matches }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const match = matches[selectedIndex] ?? matches[0];

  return (
    <>
      <div
        role="tablist"
        aria-label="매칭"
        className="mb-3 flex gap-1 overflow-x-auto shadow-[inset_0_-1px_0_var(--color-line)] [scrollbar-width:none]"
      >
        {matches.map((item, index) => {
          const isSelected = index === selectedIndex;
          return (
            <button
              key={item.petPrtcMtchSn}
              type="button"
              role="tab"
              aria-selected={isSelected}
              className={`relative h-11 shrink-0 px-3 text-sm whitespace-nowrap ${
                isSelected
                  ? 'font-bold text-brand-900 after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:bg-brand-900'
                  : 'font-semibold text-subtle hover:text-ink'
              }`}
              onClick={() => setSelectedIndex(index)}
            >
              매칭 {index + 1} · {item.ctptNcnm}
            </button>
          );
        })}
      </div>
      <div role="tabpanel">
        <MatchInfo match={match} />
      </div>
    </>
  );
}

/**
 * [펫돌봄 매칭 상세 모달]
 * - 분쟁 문의 대응용 조회만. 채팅 메시지는 보여 주지 않는다(결정 14·26)
 */
export default function CareMatchDetailModal({ petPrtcRcrtSn, onClose }) {
  const recruit = useAdminCareRecruit(petPrtcRcrtSn);

  const renderBody = () => {
    if (recruit.isPending) {
      return (
        <div className="space-y-3" aria-busy="true">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      );
    }
    if (recruit.isError) {
      return (
        <div role="alert" className="flex flex-col items-center gap-3 py-8">
          <p className="text-base text-subtle">
            매칭 정보를 불러오지 못했어요.
          </p>
          <button
            type="button"
            className={BTN_SECONDARY}
            onClick={() => recruit.refetch()}
          >
            다시 시도
          </button>
        </div>
      );
    }
    const { data } = recruit;
    return (
      <div className="space-y-4">
        <dl className="rounded-[14px] border border-line bg-white">
          <InfoRow label="모집글">{data.pstTtl}</InfoRow>
          <InfoRow label="모집 상태">
            {getRcrtStatusLabel(data.rcrtSttsCd)} · {data.mbrNcnm} ·{' '}
            {formatCost(data.cstAmt, data.cstUnitCd)}
          </InfoRow>
        </dl>
        {data.mtchs.length === 0 ? (
          <p className="rounded-[14px] border border-line bg-white py-10 text-center text-base text-subtle">
            아직 매칭이 없어요
          </p>
        ) : data.mtchs.length === 1 ? (
          <MatchInfo match={data.mtchs[0]} />
        ) : (
          <MatchTabs matches={data.mtchs} />
        )}
      </div>
    );
  };

  return (
    <Modal title="매칭 상세" isWide onClose={onClose}>
      {renderBody()}
      <p className="mt-4 rounded-[10px] bg-surface-2 px-4 py-3 text-sm leading-[1.5] text-subtle">
        채팅 내용은 볼 수 없어요
      </p>
    </Modal>
  );
}
