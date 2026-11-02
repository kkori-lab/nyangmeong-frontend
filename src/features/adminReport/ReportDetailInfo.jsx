import { generatePath, Link } from 'react-router-dom';
import { PATHS } from '@/routes/paths';
import { formatDateTime } from '@/utils/formatDate';
import {
  getActionLabel,
  getOptionLabel,
  getTargetLabel,
  REPORT_REASON_OPTIONS,
  REPORT_STATUS_OPTIONS,
  TARGET_POST_STATUS_OPTIONS,
} from './reportLabels';

/** 회원 상세 링크 */
function MemberLink({ mbrSn, mbrNcnm }) {
  return (
    <Link
      to={generatePath(PATHS.ADMIN_MEMBER_DETAIL, { mbrSn })}
      className="hover:underline"
    >
      {mbrNcnm}
    </Link>
  );
}

/** 대상의 현재 상태 */
const getTargetStatus = (report) => {
  if (report.cmntSn == null) {
    return getOptionLabel(TARGET_POST_STATUS_OPTIONS, report.pstSttsCd);
  }
  return report.delYn ? '삭제' : '정상';
};

/**
 * [신고 상세 정보]
 * - 게시글 대상 -> 게시글 상세, 작성자·신고자 -> 회원 상세
 * - 처리 정보는 처리된 신고에만 표시
 */
export default function ReportDetailInfo({ report }) {
  const isPost = report.cmntSn == null;

  const rows = [
    ['대상', `${getTargetLabel(report)} · ${getTargetStatus(report)}`],
    [
      '작성자',
      <MemberLink
        key="author"
        mbrSn={report.trgtMbrSn}
        mbrNcnm={report.trgtMbrNcnm}
      />,
    ],
    ...(isPost
      ? [
          [
            '제목',
            <Link
              key="title"
              to={generatePath(PATHS.ADMIN_POST_DETAIL, {
                pstSn: report.pstSn,
              })}
              className="hover:underline"
            >
              {report.pstTtl}
            </Link>,
          ],
        ]
      : []),
    [
      '내용',
      <p key="body" className="whitespace-pre-line">
        {isPost ? report.pstCn : report.cmntCn}
      </p>,
    ],
    ['신고 사유', getOptionLabel(REPORT_REASON_OPTIONS, report.dclrRsnCd)],
    ...(report.dclrDtlCn
      ? [
          [
            '상세 내용',
            <p key="detail" className="whitespace-pre-line">
              {report.dclrDtlCn}
            </p>,
          ],
        ]
      : []),
    [
      '신고자',
      <MemberLink
        key="reporter"
        mbrSn={report.mbrSn}
        mbrNcnm={report.mbrNcnm}
      />,
    ],
    ['접수일', formatDateTime(report.regDt)],
    ['처리 상태', getOptionLabel(REPORT_STATUS_OPTIONS, report.dclrPrcsSttsCd)],
    ...(report.dclrActnCd
      ? [['조치', getActionLabel(report.dclrActnCd, report)]]
      : []),
    ...(report.prcsDt ? [['처리일', formatDateTime(report.prcsDt)]] : []),
  ];

  return (
    <dl className="rounded-[14px] border border-line bg-white">
      {rows.map(([label, value]) => (
        <div
          key={label}
          className="grid grid-cols-[180px_1fr] gap-3 border-b border-line px-4 py-3 text-base last:border-b-0 max-[760px]:grid-cols-[130px_1fr]"
        >
          <dt className="text-subtle">{label}</dt>
          <dd className="min-w-0 break-words text-ink-2">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
