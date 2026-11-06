import { JOIN_PATH_NAME } from '../shared/snsCodes';
import AccountRow from './AccountRow';
import SnsBadge from './SnsBadge';

/** 'YYYY-MM-DD...' -> 'YYYY.MM.DD' */
const formatDay = (dt) => dt.slice(0, 10).replaceAll('-', '.');
/** 'YYYY-MM-DDTHH:MM:SS' -> 'YYYY.MM.DD HH:MM', 첫 로그인 전(null)은 '-' */
const formatDayTime = (dt) =>
  dt ? `${formatDay(dt)} ${dt.slice(11, 16)}` : '-';

/** 가입 방식·가입일·최근 로그인. 조회 전용이라 수정 버튼 없음 */
export default function AccountInfoCard({
  snsTyCd,
  joinPathCd,
  joinDt,
  lastLgnDt,
}) {
  return (
    <>
      <AccountRow
        label="가입 방식"
        value={
          <>
            {snsTyCd && <SnsBadge snsTyCd={snsTyCd} />}
            {JOIN_PATH_NAME[joinPathCd]}
          </>
        }
      />
      <AccountRow
        label="가입일"
        value={<span className="tabular-nums">{formatDay(joinDt)}</span>}
      />
      <AccountRow
        label="최근 로그인"
        value={<span className="tabular-nums">{formatDayTime(lastLgnDt)}</span>}
      />
    </>
  );
}
