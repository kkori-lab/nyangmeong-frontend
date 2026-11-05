import { Link } from 'react-router-dom';
import Card from '@/components/Card';
import Icon from '@/components/Icon';
import { formatDate } from '@/utils/formatDate';
import { TIMELINE_PREVENTION } from '../summaryApi';
import { CardTitle, MoreLink, SummaryEmpty } from './SummaryParts';
import {
  DIARY_EXAM_PATH,
  PREVENTION_TIMELINE,
  getCheckupDetailPath,
  getCheckupType,
} from './summaryUtils';

/**
 * [건강 이력 타임라인] (FN-HLT-011-03)
 * - 검진기록과 반복 예방(시작일)을 유형 구분 없이 시간순으로 섞은 최신 5건, 항목을 누르면 검진상세
 *   (반복 예방은 그 검진상세의 반복 예방 탭)
 * - 아이콘은 세로 선으로 이어지고 모두 유형별 연한 배경, [전체 보기]는 건강 일지의 검진기록 영역
 * - 첫 줄 아래 "· " 한 줄: 검진기록은 진료 내용 첫 줄, 반복 예방은 항목 이름. 없으면 첫 줄만
 */
export default function TimelineCard({ timeline }) {
  return (
    <Card
      title={<CardTitle icon="schedule">건강 이력 타임라인</CardTitle>}
      action={timeline.length > 0 && <MoreLink to={DIARY_EXAM_PATH} />}
      className="h-full"
      bodyClassName="p-0!"
    >
      {timeline.length === 0 ? (
        <div className="px-[18px] pt-4 pb-[18px] sm:px-[22px]">
          <SummaryEmpty
            icon="schedule"
            description="병원에 다녀온 기록을 남기면 여기에 시간순으로 모여요"
            action="건강 일지에서 검진기록 등록하기"
            to={DIARY_EXAM_PATH}
          />
        </div>
      ) : (
        <ul className="relative flex flex-col px-[18px] pt-4 pb-[18px] before:absolute before:top-10 before:bottom-[46px] before:left-[37px] before:w-0.5 before:bg-line before:content-[''] sm:px-[22px] sm:before:left-[41px]">
          {timeline.map((entry) => (
            <li key={entry.tlKey}>
              <TimelineItem entry={entry} />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function TimelineItem({ entry }) {
  const isPrevention = entry.tlTypeCd === TIMELINE_PREVENTION;
  const type = isPrevention
    ? PREVENTION_TIMELINE
    : getCheckupType(entry.ckupTypeCd);
  // 검진기록은 진료 내용(ckupCn)의 첫 줄만 (추가 요청)
  const ckupLine = entry.ckupCn
    ?.split('\n')
    .map((line) => line.trim())
    .find(Boolean);
  const line = isPrevention ? entry.reptPrvntArtclCdNm : ckupLine;

  return (
    <Link
      to={getCheckupDetailPath(entry, isPrevention ? 'prevention' : undefined)}
      className="relative grid grid-cols-[40px_minmax(0,1fr)] items-start gap-3.5 py-3"
    >
      <span
        className={`relative z-10 grid size-10 place-items-center rounded-full ${type.tone.chip}`}
      >
        <Icon name={type.icon} />
      </span>
      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-semibold">{formatDate(entry.ymd)}</span>
          <span
            className={`inline-flex h-6 items-center rounded-full px-2.5 text-[13px] leading-none font-semibold ${type.tone.chip}`}
          >
            {type.nm}
          </span>
          <span className="text-subtle">{entry.hsptlNm}</span>
        </span>
        {line && (
          <span className="mt-1 block truncate text-sm text-subtle" title={line}>
            · {line}
          </span>
        )}
      </span>
    </Link>
  );
}
