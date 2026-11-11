import { useState } from 'react';
import { BTN_SECONDARY } from '@/components/buttonStyles';
import FileImage from '@/components/FileImage';
import Modal from '@/components/Modal';
import Skeleton from '@/components/Skeleton';
import { useFileImage } from '@/hooks/useFileImage';
import { formatDateTime } from '@/utils/formatDate';
import { adminCareImageUrl } from './api';
import {
  formatCost,
  getMtchStatusLabel,
  getPrtcrIdntyLabel,
  getRcrtStatusLabel,
} from './careMatchLabels';
import { adminCommunityKeys, useAdminCareRecruit } from './queries';

/** 라벨·값 한 줄 */
function InfoRow({ label, children }) {
  return (
    <div className="grid grid-cols-[112px_1fr] gap-3 border-b border-line px-4 py-3 text-base last:border-b-0 max-[760px]:grid-cols-[88px_1fr]">
      <dt className="text-subtle">{label}</dt>
      <dd className="min-w-0 break-words text-ink-2">{children}</dd>
    </div>
  );
}

/** 돌봄 기간: 시작 ~ 종료 */
const formatPeriod = (bgngDt, endDt) =>
  bgngDt || endDt
    ? `${bgngDt ? formatDateTime(bgngDt) : '—'} ~ ${endDt ? formatDateTime(endDt) : '—'}`
    : '—';

/** 합의 조건 버전: 최신 버전이 맨 위 */
function ConditionVersions({ versions }) {
  if (versions.length === 0) return '—';
  return (
    <ol className="space-y-3">
      {versions.map((version, index) => (
        <li key={version.cndVerNo} className="leading-[1.5]">
          <p className="tabular-nums">
            <span className={index === 0 ? 'font-semibold' : 'text-subtle'}>
              {version.cndVerNo}차 합의
            </span>{' '}
            <span className="text-subtle">
              · {formatDateTime(version.regDt)}
            </span>
          </p>
          <p className="tabular-nums">
            {formatCost(version.acrdCstAmt, version.cstUnitCd)} ·{' '}
            {formatPeriod(version.acrdPrtcBgngDt, version.acrdPrtcEndDt)}
          </p>
          {version.acrdPrtcCn && (
            <p className="text-subtle">{version.acrdPrtcCn}</p>
          )}
        </li>
      ))}
    </ol>
  );
}

/** 상태 이력: 시각·바뀐 상태·조건 버전·사유(오래된 순) */
function StatusHistory({ history }) {
  if (history.length === 0) return '—';
  return (
    <ol className="space-y-1">
      {history.map((item, index) => (
        <li key={index} className="leading-[1.5]">
          <span className="text-subtle tabular-nums">
            {formatDateTime(item.regDt)}
          </span>{' '}
          {item.bfrSttsCd && (
            <span className="text-subtle">
              {getMtchStatusLabel(item.bfrSttsCd)} →{' '}
            </span>
          )}
          {getMtchStatusLabel(item.aftrSttsCd)}
          {item.cndVerNo != null && (
            <span className="text-subtle tabular-nums">
              {' '}
              · {item.cndVerNo}차 조건
            </span>
          )}
          {item.chgRsn && (
            <span className="text-subtle"> · 사유: {item.chgRsn}</span>
          )}
        </li>
      ))}
    </ol>
  );
}

/** 완료 사진 한 장: 관리자 이미지 API로 받는다(파일이 없으면 빈 칸) */
function CompletionImage({ petPrtcRcrtSn, atchFileSn, alt }) {
  const { src, isPending } = useFileImage({
    queryKey: adminCommunityKeys.careImage(petPrtcRcrtSn, atchFileSn),
    url: adminCareImageUrl(petPrtcRcrtSn, atchFileSn),
  });
  return (
    <FileImage
      src={src}
      pending={isPending}
      alt={alt}
      className="size-24 rounded-[8px] object-cover"
    />
  );
}

/** 완료 요청: 회차마다 내용·사진·보호자 확인 결과 */
function CompletionDemands({ demands, petPrtcRcrtSn }) {
  if (demands.length === 0) return '—';
  return (
    <ol className="space-y-4">
      {demands.map((demand) => (
        <li key={demand.dmndCycl} className="leading-[1.5]">
          <p className="tabular-nums">
            <span className="font-semibold">{demand.dmndCycl}회차</span>{' '}
            <span className="text-subtle">
              · {formatDateTime(demand.regDt)}
            </span>
          </p>
          {demand.cmptnCn && <p>{demand.cmptnCn}</p>}
          {demand.spclMttrCn && (
            <p className="text-subtle">특이사항: {demand.spclMttrCn}</p>
          )}
          {demand.prtcEndDt && (
            <p className="text-subtle tabular-nums">
              돌봄 종료: {formatDateTime(demand.prtcEndDt)}
            </p>
          )}
          {demand.imgs.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {demand.imgs.map(({ atchFileSn }, index) => (
                <CompletionImage
                  key={atchFileSn}
                  petPrtcRcrtSn={petPrtcRcrtSn}
                  atchFileSn={atchFileSn}
                  alt={`${demand.dmndCycl}회차 완료 사진 ${index + 1}`}
                />
              ))}
            </div>
          )}
          <p className="mt-2">
            보호자 확인: {getPrtcrIdntyLabel(demand.prtcrIdntyRsltCd)}
            {demand.prtcrIdntyDt && (
              <span className="text-subtle tabular-nums">
                {' '}
                · {formatDateTime(demand.prtcrIdntyDt)}
              </span>
            )}
          </p>
          {demand.splmntDmndRsn && (
            <p className="text-subtle">
              보완 요청 사유: {demand.splmntDmndRsn}
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}

/** 매칭 한 건 */
function MatchInfo({ match, petPrtcRcrtSn }) {
  return (
    <dl className="rounded-[14px] border border-line bg-white">
      <InfoRow label="돌봄이">{match.ctptNcnm}</InfoRow>
      <InfoRow label="거래 상태">
        {getMtchStatusLabel(match.mtchDlngSttsCd)}
        <span className="text-subtle tabular-nums">
          {' '}
          · 요청 {formatDateTime(match.regDt)}
        </span>
      </InfoRow>
      <InfoRow label="합의 조건">
        <ConditionVersions versions={match.cndVers} />
      </InfoRow>
      <InfoRow label="상태 이력">
        <StatusHistory history={match.sttsHstry} />
      </InfoRow>
      <InfoRow label="완료 요청">
        <CompletionDemands
          demands={match.cmptnDmnds}
          petPrtcRcrtSn={petPrtcRcrtSn}
        />
      </InfoRow>
      <InfoRow label="수령 확인">
        {match.rcvYn ? (
          <span className="tabular-nums">
            확인함
            {match.rcvIdntyDt && ` · ${formatDateTime(match.rcvIdntyDt)}`}
          </span>
        ) : (
          '—'
        )}
      </InfoRow>
    </dl>
  );
}

/** 매칭이 여럿이면 탭으로 나눈다 */
function MatchTabs({ matches, petPrtcRcrtSn }) {
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
        <MatchInfo match={match} petPrtcRcrtSn={petPrtcRcrtSn} />
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
            {recruit.error?.message || '매칭 정보를 불러오지 못했어요.'}
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
            <span className="tabular-nums">
              {formatCost(data.cstAmt, data.cstUnitCd)}
            </span>
          </InfoRow>
        </dl>
        {data.mtchs.length === 0 ? (
          <p className="rounded-[14px] border border-line bg-white py-10 text-center text-base text-subtle">
            아직 매칭이 없어요
          </p>
        ) : data.mtchs.length === 1 ? (
          <MatchInfo match={data.mtchs[0]} petPrtcRcrtSn={data.petPrtcRcrtSn} />
        ) : (
          <MatchTabs matches={data.mtchs} petPrtcRcrtSn={data.petPrtcRcrtSn} />
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
