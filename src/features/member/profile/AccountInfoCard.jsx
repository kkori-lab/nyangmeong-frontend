import { JOIN_PATH_NAME } from '../shared/snsCodes';
import AccountRow from './AccountRow';
import SnsBadge from './SnsBadge';

/** 'YYYY-MM-DD ...' -> 'YYYY.MM.DD' */
const formatDay = (dt) => dt.slice(0, 10).replaceAll('-', '.');
/** 'YYYY-MM-DD HH:MM:SS' -> 'YYYY.MM.DD HH:MM' */
const formatDayTime = (dt) => `${formatDay(dt)} ${dt.slice(11, 16)}`;

/** 가입 방식·가입일·최근 로그인. 조회 전용이라 수정 버튼 없음 */
export default function AccountInfoCard({
  snsTyCd,
  mbrJoinPathCd,
  mbrRegDt,
  mbrLastLgnDt,
}) {
  return (
    <>
      <AccountRow
        label="가입 방식"
        value={
          <>
            {snsTyCd && <SnsBadge snsTyCd={snsTyCd} />}
            {JOIN_PATH_NAME[mbrJoinPathCd]}
          </>
        }
      />
      <AccountRow
        label="가입일"
        value={<span className="tabular-nums">{formatDay(mbrRegDt)}</span>}
      />
      <AccountRow
        label="최근 로그인"
        value={
          <span className="tabular-nums">{formatDayTime(mbrLastLgnDt)}</span>
        }
      />
    </>
  );
}
