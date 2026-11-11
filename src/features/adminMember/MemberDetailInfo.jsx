import { formatDate, formatDateTime, getHmOf } from '@/utils/formatDate';
import {
  getOptionLabel,
  JOIN_PATH_OPTIONS,
  STATUS_OPTIONS,
} from './memberLabels';

/** 정지 회원 코드 */
const SUSPENDED_CD = STATUS_OPTIONS[1].value;

/** 가입 경로 · SNS 표시 */
const formatJoinPath = ({ joinPathCd, snsLinks }) => {
  const joinPath = getOptionLabel(JOIN_PATH_OPTIONS, joinPathCd);
  if (snsLinks.length === 0) return joinPath;
  const sns = snsLinks
    .map(({ snsOffrCd }) => getOptionLabel(JOIN_PATH_OPTIONS, snsOffrCd))
    .join(', ');
  return `${joinPath} · ${sns} 연동`;
};

/** 상태 표시: 정지 회원은 종료 일시 또는 영구 */
const formatStatus = ({ mbrSttsCd, suspnEndDt }) => {
  const status = getOptionLabel(STATUS_OPTIONS, mbrSttsCd);
  if (mbrSttsCd !== SUSPENDED_CD) return status;
  if (!suspnEndDt) return `${status} (영구)`;
  const endYmd = formatDate(suspnEndDt, { separator: '-' });
  return `${status} (종료 ${endYmd} ${getHmOf(suspnEndDt)})`;
};

/**
 * [회원 상세 기본 정보]
 * - 이메일·휴대전화는 서버가 마스킹한 값 그대로
 */
export default function MemberDetailInfo({ member }) {
  const rows = [
    ['닉네임', member.mbrNcnm],
    [
      '이메일 · 휴대전화',
      `${member.maskedAcntEml} · ${member.maskedMblTelno ?? '—'}`,
    ],
    ['가입 경로 · SNS', formatJoinPath(member)],
    [
      '가입일 · 최근 로그인',
      `${formatDate(member.regDt, { separator: '-' })} · ${
        member.lastLgnDt ? formatDateTime(member.lastLgnDt) : '—'
      }`,
    ],
    [
      '보유 포인트',
      <span key="hldPnt" className="tabular-nums">
        {member.hldPnt.toLocaleString()}P
      </span>,
    ],
    ['상태', formatStatus(member)],
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
