import { generatePath, Link } from 'react-router-dom';
import { PATHS } from '@/routes/paths';
import { formatDateTime } from '@/utils/formatDate';
import { getOptionLabel, INQUIRY_CATEGORY_OPTIONS } from './inquiryLabels';

/**
 * [1:1 문의 상세 정보]
 * - 작성자 -> 회원 상세
 * - 회원이 삭제한 문의는 상태 옆에 "회원 삭제"
 */
export default function InquiryDetailInfo({ inquiry }) {
  const rows = [
    [
      '유형',
      `${inquiry.inqryTypeCdNm} · ${getOptionLabel(INQUIRY_CATEGORY_OPTIONS, inquiry.inqryCtgr)}`,
    ],
    [
      '처리 상태',
      inquiry.delYn
        ? `${inquiry.inqryPrcsSttsCdNm} · 회원 삭제`
        : inquiry.inqryPrcsSttsCdNm,
    ],
    ['제목', inquiry.inqryTtl],
    [
      '내용',
      <p key="body" className="whitespace-pre-line">
        {inquiry.inqryCn}
      </p>,
    ],
    [
      '작성자',
      <Link
        key="author"
        to={generatePath(PATHS.ADMIN_MEMBER_DETAIL, { mbrSn: inquiry.mbrSn })}
        className="hover:underline"
      >
        {inquiry.mbrNcnm ?? `회원 ${inquiry.mbrSn}`}
      </Link>,
    ],
    ['접수일', formatDateTime(inquiry.regDt)],
  ];

  return (
    <dl className="rounded-[14px] border border-line bg-white">
      {rows.map(([label, value]) => (
        <div
          key={label}
          className="grid grid-cols-[180px_1fr] gap-3 border-b border-line px-4 py-3 text-base last:border-b-0 max-[760px]:grid-cols-[100px_1fr]"
        >
          <dt className="text-subtle">{label}</dt>
          <dd className="min-w-0 break-words text-ink-2">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
