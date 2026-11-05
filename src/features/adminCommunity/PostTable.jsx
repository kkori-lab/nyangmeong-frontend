import { generatePath, Link } from 'react-router-dom';
import { PATHS } from '@/routes/paths';
import { formatDate } from '@/utils/formatDate';
import { BBS_OPTIONS, getOptionLabel, POST_STATUS_OPTIONS } from './postLabels';
import { ADMIN_TABLE_BOX } from '@/components/adminTableStyles';

const COLUMNS = ['게시판', '제목', '작성자', '상태', '신고', '작성일'];

/**
 * [게시글 목록 표]
 * - 행 클릭·Enter -> 게시글 상세, 작성자 -> 회원 상세
 * - 좁은 폭에서는 표 안에서만 가로 스크롤
 */
export default function PostTable({ posts, onSelect }) {
  return (
    <div className={ADMIN_TABLE_BOX}>
      <table className="w-full min-w-[760px] text-left text-base">
        <thead>
          <tr className="border-b border-line text-sm text-subtle">
            {COLUMNS.map((column) => (
              <th key={column} scope="col" className="px-4 py-3 font-semibold">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr
              key={post.pstSn}
              tabIndex={0}
              className="cursor-pointer border-b border-line text-ink-2 last:border-b-0 hover:bg-surface-2"
              onClick={() => onSelect(post.pstSn)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') onSelect(post.pstSn);
              }}
            >
              <td className="px-4 py-3 whitespace-nowrap">
                {getOptionLabel(BBS_OPTIONS, post.bbsCd)}
              </td>
              <td className="max-w-[420px] truncate px-4 py-3">
                {post.pstTtl}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <Link
                  to={generatePath(PATHS.ADMIN_MEMBER_DETAIL, {
                    mbrSn: post.mbrSn,
                  })}
                  className="hover:underline"
                  onClick={(event) => event.stopPropagation()}
                  onKeyDown={(event) => event.stopPropagation()}
                >
                  {post.mbrNcnm}
                </Link>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {getOptionLabel(POST_STATUS_OPTIONS, post.pstSttsCd)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                {post.dclrCnt.toLocaleString()}
              </td>
              <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                {formatDate(post.regDt, { separator: '-' })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
