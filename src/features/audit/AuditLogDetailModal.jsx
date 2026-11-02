import { BTN_SECONDARY } from '@/components/buttonStyles';
import Modal from '@/components/Modal';
import Skeleton from '@/components/Skeleton';
import { EMPTY_LABEL } from './auditLabels';
import { useAuditLog } from './queries';

/** 전·후 값 한 칸 표기 */
const formatValue = (value) => {
  if (value === undefined || value === null) return EMPTY_LABEL;
  return typeof value === 'object' ? JSON.stringify(value) : String(value);
};

/** 바뀌기 전·후 값 항목별 표 */
function ChangeTable({ chgBfrCn, chgAftrCn }) {
  const names = Object.keys({ ...chgBfrCn, ...chgAftrCn });
  if (names.length === 0) {
    return <p className="text-base text-subtle">바뀐 값이 없어요.</p>;
  }
  return (
    <div className="overflow-x-auto rounded-md border border-line">
      <table className="w-full text-left text-base">
        <thead>
          <tr className="border-b border-line text-sm text-subtle">
            <th scope="col" className="px-3 py-2 font-semibold">
              항목
            </th>
            <th scope="col" className="px-3 py-2 font-semibold">
              바뀌기 전
            </th>
            <th scope="col" className="px-3 py-2 font-semibold">
              바뀐 후
            </th>
          </tr>
        </thead>
        <tbody>
          {names.map((name) => (
            <tr key={name} className="border-b border-line last:border-b-0">
              <td className="px-3 py-2 break-all text-ink-2">{name}</td>
              <td className="px-3 py-2 break-all text-ink">
                {formatValue(chgBfrCn?.[name])}
              </td>
              <td className="px-3 py-2 break-all text-ink">
                {formatValue(chgAftrCn?.[name])}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * [감사 로그 상세 모달]
 * - 바뀌기 전·후 값과 접속 IP, 조회만 가능
 */
export default function AuditLogDetailModal({ mngrTaskLogSn, onClose }) {
  const { data, isPending, isError, refetch } = useAuditLog(mngrTaskLogSn);

  const handleRetry = () => refetch();

  /** 본문: 로딩 / 오류 / 상세 */
  const renderBody = () => {
    if (isPending) {
      return (
        <div aria-busy="true" className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-5 w-40" />
        </div>
      );
    }
    if (isError) {
      return (
        <div role="alert" className="flex flex-col items-center gap-3 py-8">
          <p className="text-base text-subtle">상세를 불러오지 못했어요.</p>
          <button type="button" className={BTN_SECONDARY} onClick={handleRetry}>
            다시 시도
          </button>
        </div>
      );
    }
    return (
      <div className="space-y-3">
        <ChangeTable chgBfrCn={data.chgBfrCn} chgAftrCn={data.chgAftrCn} />
        <p className="text-base text-ink-2">
          접속 IP {data.cntnIpAddr ?? EMPTY_LABEL}
        </p>
      </div>
    );
  };

  return (
    <Modal title="감사 로그 상세" isWide onClose={onClose}>
      {renderBody()}
    </Modal>
  );
}
