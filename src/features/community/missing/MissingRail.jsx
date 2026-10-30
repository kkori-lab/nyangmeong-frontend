import { ChevronRight, Heart } from 'lucide-react';
import { generatePath, Link } from 'react-router-dom';
import { PATHS } from '@/routes/paths';
import { formatRelativeTime } from '@/utils/formatDate';
import { getPetLabel } from '../missingCodes';
import { useMissingRail } from '../missingQueries';
import CheckList from './CheckList';
import MissingStatusBadge from './MissingStatusBadge';

const GUIDE_ITEMS = [
  ['반경 500m 먼저 찾기', '놀란 아이는 대부분 멀리 못 가고 근처에 숨어 있어요'],
  [
    '익숙한 냄새 두기',
    '집 앞에 평소 쓰던 방석 · 옷을 놓아 스스로 돌아오게 해요',
  ],
  [
    '바로 신고하기',
    '동물보호관리시스템 · 관할 경찰서에 신고하고 인식칩 등록을 확인해요',
  ],
  [
    '전단지 · SNS 알리기',
    '실종 장소 주변에 전단지를 붙이고 동네 커뮤니티에 공유해요',
  ],
  ['해질녘 · 새벽에 다시 찾기', '사람이 적은 시간에 움직이는 경우가 많아요'],
];

const H2_CLASS = 'pb-3 text-lg leading-[1.4] font-bold text-ink';

/** 실종센터 목록 오른쪽 레일: 실종 Check 가이드 · 최근 실종 소식 · 최근 찾은 반려동물 */
export default function MissingRail() {
  const { data } = useMissingRail();

  return (
    <aside aria-label="실종 안내" className="flex min-w-0 flex-col gap-10">
      <section aria-labelledby="missing-guide-title">
        <h2 id="missing-guide-title" className={H2_CLASS}>
          실종 Check 가이드
        </h2>
        <CheckList items={GUIDE_ITEMS} />
        <Link
          to={PATHS.NOTICES}
          className="mt-1 inline-flex min-h-10 items-center gap-0.5 text-sm font-semibold text-brand-600 hover:underline"
        >
          자세한 대처 요령 보기
          <ChevronRight size={16} aria-hidden="true" />
        </Link>
      </section>

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
                className="group flex min-h-[52px] items-center gap-2.5"
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
                {/* 남의 찾았어요 글은 이름이 null이라 제목으로 */}
                {item.petNm ? (
                  <span>
                    <b>{item.petNm}</b>가 무사히 가족의 품으로 돌아갔어요
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
