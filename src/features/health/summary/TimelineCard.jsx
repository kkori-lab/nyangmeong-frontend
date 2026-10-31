import { Link } from 'react-router-dom';
import Card from '@/components/Card';
import Icon from '@/components/Icon';
import { formatDate } from '@/utils/formatDate';
import { PREVENTION_ITEMS, findName } from '../checkup/checkupTypes';
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
 * - 아이콘은 세로 선으로 이어지고 첫 항목만 진한 초록, [전체 보기]는 건강 일지의 검진기록 영역
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
          {timeline.map((entry, index) => (
            <li key={entry.tlKey}>
              <TimelineItem entry={entry} isFirst={index === 0} />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function TimelineItem({ entry, isFirst }) {
  const isPrevention = entry.tlTypeCd === TIMELINE_PREVENTION;
  const type = isPrevention
    ? PREVENTION_TIMELINE
    : getCheckupType(entry.ckupTypeCd);
  const lines = isPrevention
    ? [findName(PREVENTION_ITEMS, entry.prvntItmCd)]
    : entry.cn.split('\n').filter(Boolean);

  return (
    <Link
      to={getCheckupDetailPath(
        entry,
        isPrevention ? 'prevention' : undefined,
      )}
      className="relative grid grid-cols-[40px_minmax(0,1fr)_18px] items-start gap-3.5 py-3"
    >
      <span
        className="relative z-10 grid size-10 place-items-center rounded-full"
        style={
          isFirst
            ? { background: '#285a5c', color: '#fff' }
            : { background: type.tone.bg, color: type.tone.fg }
        }
      >
        <Icon name={type.icon} />
      </span>
      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-semibold">{formatDate(entry.ymd)}</span>
          <span
            className="inline-flex h-6 items-center rounded-full px-2.5 text-[13px] leading-none font-semibold"
            style={{ background: type.tone.bg, color: type.tone.fg }}
          >
            {type.nm}
          </span>
          <span className="text-subtle">{entry.hospNm}</span>
        </span>
        <span className="mt-1 flex flex-col text-muted">
          {lines.map((line) => (
            <span key={line}>· {line}</span>
          ))}
        </span>
      </span>
      <Icon name="chevron_right" className="text-xl text-subtle" />
    </Link>
  );
}
