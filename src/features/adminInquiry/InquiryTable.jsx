import { generatePath, Link } from 'react-router-dom';
import { PATHS } from '@/routes/paths';
import { formatDate } from '@/utils/formatDate';
import { getOptionLabel, INQUIRY_CATEGORY_OPTIONS } from './inquiryLabels';

const COLUMNS = ['유형', '내부 분류', '제목', '작성자', '상태', '접수일'];

/**
 * [1:1 문의 목록 표]
 * - 행 클릭·Enter -> 문의 상세, 작성자 -> 회원 상세
 * - 회원이 삭제한 문의는 제목 앞에 "삭제됨"
 * - 좁은 폭에서는 표 안에서만 가로 스크롤
 */
export default function InquiryTable({ inquiries, onSelect }) {
  return (
    <div className="overflow-x-auto rounded-[14px] border border-line bg-white">
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
          {inquiries.map((inquiry) => (
            <tr
              key={inquiry.otoInqrySn}
              tabIndex={0}
              className="cursor-pointer border-b border-line text-ink-2 last:border-b-0 hover:bg-surface-2"
              onClick={() => onSelect(inquiry.otoInqrySn)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') onSelect(inquiry.otoInqrySn);
              }}
            >
              <td className="px-4 py-3 whitespace-nowrap">
                {inquiry.inqryTypeCdNm}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {getOptionLabel(INQUIRY_CATEGORY_OPTIONS, inquiry.inqryCtgr)}
              </td>
              <td className="max-w-[360px] truncate px-4 py-3">
                {inquiry.delYn && (
                  <span className="mr-1.5 text-sm font-semibold text-subtle">
                    [삭제됨]
                  </span>
                )}
                {inquiry.inqryTtl}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <Link
                  to={generatePath(PATHS.ADMIN_MEMBER_DETAIL, {
                    mbrSn: inquiry.mbrSn,
                  })}
                  className="hover:underline"
                  onClick={(event) => event.stopPropagation()}
                  onKeyDown={(event) => event.stopPropagation()}
                >
                  {inquiry.mbrNcnm}
                </Link>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {inquiry.inqryPrcsSttsCdNm}
              </td>
              <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                {formatDate(inquiry.regDt, { separator: '-' })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
