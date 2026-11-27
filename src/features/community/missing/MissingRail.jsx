import { ChevronRight, Heart } from 'lucide-react';
import { generatePath, Link } from 'react-router-dom';
import { PATHS } from '@/routes/paths';
import { pickJosa } from '@/utils/josa';
import { formatRelativeTime } from '@/utils/formatDate';
import { getPetLabel } from '../missingCodes';
import { useMissingRail } from '../missingQueries';
import MissingStatusBadge from './MissingStatusBadge';

const H2_CLASS = 'pb-2 text-lg font-bold tracking-[-0.01em] text-ink';

/** 실종센터 목록 오른쪽 레일: 최근 실종 소식 · 최근 찾은 반려동물(실종 체크 가이드는 왼쪽 사이드 메뉴 아래 버튼) */
export default function MissingRail() {
  const { data } = useMissingRail();

  return (
    <aside aria-label="실종 안내" className="flex min-w-0 flex-col gap-10">
      <section aria-labelledby="missing-news-title">
        <h2 id="missing-news-title" className={H2_CLASS}>
          최근 실종 소식
        </h2>
        <ul>
          {data?.news.map((item) => (
            <li
              key={item.lostTpofSn}
              className="border-t border-line first:border-t-0"
            >
              <Link
                to={generatePath(PATHS.COMMUNITY_MISSING_DETAIL, {
                  lostTpofSn: item.lostTpofSn,
                })}
                className="group flex min-h-[52px] items-center gap-3"
              >
                <MissingStatusBadge post={item} className="shrink-0" />
                <span className="min-w-0 flex-1 truncate font-medium text-ink group-hover:text-brand-600">
                  {getPetLabel(item)}
                </span>
                <small className="shrink-0 text-sm text-subtle">
                  {formatRelativeTime(item.regDt)}
                </small>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="missing-found-title">
        <h2 id="missing-found-title" className={H2_CLASS}>
          최근 찾은 반려동물
        </h2>
        <ul>
          {data?.found.map((item) => (
            <li
              key={item.lostTpofSn}
              className="border-t border-line first:border-t-0"
            >
              <Link
                to={generatePath(PATHS.COMMUNITY_MISSING_DETAIL, {
                  lostTpofSn: item.lostTpofSn,
                })}
                className="group flex items-start gap-2 py-3 text-sm leading-[1.6] text-ink-2 hover:text-brand-600"
              >
                <Heart
                  size={20}
                  aria-hidden="true"
                  className="shrink-0 text-tone-green-fg"
                />
                {/* 이름이 없는 글만 제목으로(남의 찾았어요 글도 서버가 이름을 준다) */}
                {item.petNm ? (
                  <span>
                    <b>{item.petNm}</b>
                    {pickJosa(item.petNm, '이/가')} 무사히 가족의 품으로
                    돌아갔어요
                  </span>
                ) : (
                  <span>{item.pstTtl}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
