import { generatePath, Link } from 'react-router-dom';
import { PATHS } from '@/routes/paths';
import { formatDate, getHmOf } from '@/utils/formatDate';
import {
  CHAR_JOB_STTS,
  CHAR_JOB_STTS_FAIL,
  getCodeName,
} from './processingLabels';
import { ADMIN_TABLE_BOX } from '@/components/adminTableStyles';

const COLUMNS = ['요청 일시', '회원', '상태', '실패 사유', '연결 문의'];

/**
 * [캐릭터 생성 작업 표]
 * - 생성 결과 이미지는 보이지 않고 상태·실패 사유만, 연결 문의는 문의 상세로
 * - 좁은 폭에서는 표 안에서만 가로 스크롤
 */
export default function CharacterJobTable({ jobs }) {
  return (
    <div className={ADMIN_TABLE_BOX}>
      <table className="w-full min-w-[720px] text-left text-base">
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
          {jobs.map((job) => {
            const isFail = job.crtJobSttsCd === CHAR_JOB_STTS_FAIL;
            return (
              <tr
                key={job.charCrtJobSn}
                className="border-b border-line text-ink-2 last:border-b-0"
              >
                <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                  {formatDate(job.regDt, {
                    hasYear: false,
                    separator: '-',
                  })}{' '}
                  {getHmOf(job.regDt)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{job.mbrNcnm}</td>
                <td
                  className={`px-4 py-3 whitespace-nowrap ${isFail ? 'font-semibold text-danger' : ''}`}
                >
                  {getCodeName(CHAR_JOB_STTS, job.crtJobSttsCd)}
                </td>
                <td className="px-4 py-3">{job.failRsn || '—'}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {job.otoInqrySn != null ? (
                    <Link
                      to={generatePath(PATHS.ADMIN_INQUIRY_DETAIL, {
                        otoInqrySn: job.otoInqrySn,
                      })}
                      className="font-semibold text-brand-600 underline underline-offset-2 hover:text-brand-900"
                    >
                      문의 #{job.otoInqrySn}
                    </Link>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
