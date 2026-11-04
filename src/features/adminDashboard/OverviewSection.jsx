import { generatePath, useNavigate } from 'react-router-dom';
import { PATHS } from '@/routes/paths';
import { formatDate, getYmdOf } from '@/utils/formatDate';
import DashboardPanel from './DashboardPanel';
import DashboardTable from './DashboardTable';

/** 월-일 표기 */
const toMonthDay = (dateTime) =>
  formatDate(getYmdOf(dateTime), { hasYear: false, separator: '-' });

const MEMBER_COLUMNS = [
  { key: 'mbrNcnm', label: '닉네임', render: (row) => row.mbrNcnm },
  {
    key: 'regDt',
    label: '가입일',
    className: 'w-20 whitespace-nowrap tabular-nums',
    render: (row) => toMonthDay(row.regDt),
  },
];

const POST_COLUMNS = [
  {
    key: 'bbsNm',
    label: '게시판',
    className: 'w-24 whitespace-nowrap',
    render: (row) => row.bbsNm,
  },
  {
    key: 'pstTtl',
    label: '제목',
    className: 'max-w-0 truncate',
    render: (row) => row.pstTtl,
  },
  {
    key: 'regDt',
    label: '작성일',
    className: 'w-20 whitespace-nowrap tabular-nums',
    render: (row) => toMonthDay(row.regDt),
  },
];

/**
 * [운영 현황]
 * - 회원·가입·게시글 건수 카드 + 최근 가입 회원 5명·최근 게시글 5건
 * - 회원 행 -> 회원 상세, 게시글 행 -> 게시글 상세
 */
export default function OverviewSection({ overview }) {
  const navigate = useNavigate();

  const cards = [
    {
      key: 'mbr',
      label: '전체 회원',
      value: overview.totMbrCnt,
      note: `정상 ${overview.nrmlMbrCnt.toLocaleString()} · 정지 ${overview.stopMbrCnt.toLocaleString()}`,
    },
    { key: 'today', label: '오늘 가입', value: overview.todayJoinCnt },
    { key: 'week', label: '최근 7일 가입', value: overview.weekJoinCnt },
    { key: 'pst', label: '전체 게시글', value: overview.totPstCnt },
  ];

  return (
    <section aria-labelledby="dashboard-overview" className="space-y-3">
      <h2 id="dashboard-overview" className="text-lg font-bold text-ink">
        운영 현황
      </h2>
      <ul className="grid grid-cols-2 gap-3 min-[1101px]:grid-cols-4">
        {cards.map(({ key, label, value, note }) => (
          <li
            key={key}
            className="rounded-[14px] border border-line bg-white px-5 py-4"
          >
            <span className="block text-sm font-medium text-subtle">
              {label}
            </span>
            <span className="mt-1 block text-2xl leading-tight font-bold text-ink tabular-nums">
              {value.toLocaleString()}
            </span>
            {note && (
              <span className="mt-0.5 block text-sm text-subtle tabular-nums">
                {note}
              </span>
            )}
          </li>
        ))}
      </ul>
      <div className="grid gap-3 min-[1101px]:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <DashboardPanel title="최근 가입 회원 5명">
          <DashboardTable
            columns={MEMBER_COLUMNS}
            rows={overview.recentMbrs}
            rowKey="mbrSn"
            emptyText="가입한 회원이 없어요"
            onSelect={(row) =>
              navigate(
                generatePath(PATHS.ADMIN_MEMBER_DETAIL, { mbrSn: row.mbrSn }),
              )
            }
          />
        </DashboardPanel>
        <DashboardPanel title="최근 게시글 5건">
          <DashboardTable
            columns={POST_COLUMNS}
            rows={overview.recentPsts}
            rowKey="pstSn"
            emptyText="게시글이 없어요"
            onSelect={(row) =>
              navigate(
                generatePath(PATHS.ADMIN_POST_DETAIL, { pstSn: row.pstSn }),
              )
            }
          />
        </DashboardPanel>
      </div>
    </section>
  );
}
