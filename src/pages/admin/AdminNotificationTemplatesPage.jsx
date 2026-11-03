import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BTN_SECONDARY } from '@/components/buttonStyles';
import Skeleton from '@/components/Skeleton';
import SkeletonCard from '@/components/SkeletonCard';
import TemplateChannelTabs from '@/features/adminNotificationTemplate/TemplateChannelTabs';
import TemplateFormModal from '@/features/adminNotificationTemplate/TemplateFormModal';
import TemplateTable from '@/features/adminNotificationTemplate/TemplateTable';
import {
  useAdminNotificationTemplates,
  useNotificationChannels,
  useNotificationTypes,
} from '@/features/adminNotificationTemplate/queries';
import { isForbiddenError } from '@/utils/isForbiddenError';
import AdminForbidden from './AdminForbidden';

/** 안내 줄 + 채널 탭 + 표(머리 줄 + 20행, 높이는 행 높이로 계산한 값) */
function TemplateListSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <Skeleton className="h-6 w-[360px] max-w-full" />
      <Skeleton className="h-12 w-full" />
      <SkeletonCard className="h-[1108px] max-[760px]:h-[1160px]" />
    </div>
  );
}

/** 유형 × 채널 행: 고른 채널만, 템플릿이 없으면 template null */
const buildRows = ({ types, channels, templates, notiChnlCd }) =>
  types.flatMap((type) =>
    channels
      .filter((channel) => !notiChnlCd || channel.comCd === notiChnlCd)
      .map((channel) => ({
        type,
        channel,
        template:
          templates.find(
            (template) =>
              template.notiTypeCd === type.comCd &&
              template.notiChnlCd === channel.comCd,
          ) ?? null,
      })),
  );

/**
 * [알림 템플릿]
 * - 알림 유형(AIMG02) × 채널(AIMG03)마다 한 행, 채널 탭은 ?notiChnlCd=
 * - 템플릿이 없거나 사용하지 않는 알림은 서버가 기본 문구로 보낸다
 * - [등록]·[수정] -> 등록·수정 모달
 */
export default function AdminNotificationTemplatesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  /** 열린 모달의 행: null이면 닫힘 */
  const [editing, setEditing] = useState(null);

  const notiChnlCd = searchParams.get('notiChnlCd') ?? '';
  const types = useNotificationTypes();
  const channels = useNotificationChannels();
  const templates = useAdminNotificationTemplates(
    notiChnlCd ? { notiChnlCd } : {},
  );
  const queries = [types, channels, templates];

  const handleRetry = () => {
    queries
      .filter((query) => query.isError)
      .forEach((query) => query.refetch());
  };
  const handleChannelSelect = (next) =>
    setSearchParams(next ? { notiChnlCd: next } : {});

  const renderError = (message) => (
    <div role="alert" className="flex flex-col items-center gap-3 py-16">
      <p className="text-base text-subtle">{message}</p>
      <button type="button" className={BTN_SECONDARY} onClick={handleRetry}>
        다시 시도
      </button>
    </div>
  );

  const renderList = () => {
    if (templates.isError) {
      return renderError('알림 템플릿을 불러오지 못했어요.');
    }
    const rows = buildRows({
      types: types.data,
      channels: channels.data,
      templates: templates.data,
      notiChnlCd,
    });
    if (rows.length === 0) {
      return (
        <p className="rounded-[14px] border border-line bg-white py-16 text-center text-base text-subtle">
          알림 유형이 없어요
        </p>
      );
    }
    return <TemplateTable rows={rows} onEdit={setEditing} />;
  };

  /** 본문: 로딩 / 403 / 공통코드 오류 / 목록 */
  const renderBody = () => {
    if (queries.some((query) => query.isPending))
      return <TemplateListSkeleton />;
    const forbiddenError = queries
      .map((query) => query.error)
      .find(isForbiddenError);
    if (forbiddenError) {
      return <AdminForbidden message={forbiddenError.message} />;
    }
    if (types.isError || channels.isError) {
      return renderError('알림 유형과 채널을 불러오지 못했어요.');
    }
    return (
      <>
        <p className="mb-4 text-sm text-subtle">
          템플릿이 없거나 사용하지 않는 알림은 기본 문구로 보냅니다.
        </p>
        <TemplateChannelTabs
          channels={channels.data}
          selected={notiChnlCd}
          onSelect={handleChannelSelect}
        />
        <div role="tabpanel">{renderList()}</div>
      </>
    );
  };

  return (
    <div className="mx-auto max-w-[1200px]">
      <h1 className="mb-5 text-2xl font-bold text-ink">알림 템플릿</h1>
      {renderBody()}
      {editing && (
        <TemplateFormModal row={editing} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}
