import { useState } from 'react';
import {
  Link,
  generatePath,
  useLocation,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import PageSkeleton from '@/components/PageSkeleton';
import SkeletonCard from '@/components/SkeletonCard';
import AttachmentTab from '@/features/health/checkup/AttachmentTab';
import CheckupInfoCard from '@/features/health/checkup/CheckupInfoCard';
import DetailTabs from '@/features/health/checkup/DetailTabs';
import PreventionTab from '@/features/health/checkup/PreventionTab';
import PrescriptionTab from '@/features/health/checkup/PrescriptionTab';
import ResultsTab from '@/features/health/checkup/ResultsTab';
import { PANEL } from '@/features/health/checkup/checkupStyles';
import {
  ATTACHMENT_IMAGE,
  DETAIL_TABS,
  getPanelId,
  getTabId,
} from '@/features/health/checkup/checkupTypes';
import { useCheckupDetail, usePets } from '@/features/health/queries';
import SubPageLayout from '@/layouts/SubPageLayout';
import { PATHS } from '@/routes/paths';

/** 공용 페이지 머리·사이드 메뉴 설정 */
const LAYOUT_PROPS = {
  section: 'health',
  menu: PATHS.HEALTH_DIARY,
  title: '검진상세',
  back: false,
  description: '병원에서 받은 검사 결과와 처방을 한곳에서 확인해요',
  contentClassName: 'gap-7 tabular-nums antialiased min-[1101px]:pt-6',
};

const DEFAULT_TAB = 'result';

export default function CheckupDetailPage() {
  const { ckupRcdSn } = useParams();

  return <CheckupDetail key={ckupRcdSn} ckupRcdSn={Number(ckupRcdSn)} />;
}

function CheckupDetail({ ckupRcdSn }) {
  const [searchParams] = useSearchParams();
  const { state } = useLocation();
  const requestedTab = searchParams.get('tab');
  const [tabKey, setTabKey] = useState(
    DETAIL_TABS.some((tab) => tab.key === requestedTab)
      ? requestedTab
      : DEFAULT_TAB,
  );
  /** 영상검사 칩의 [첨부 자료 탭에서 등록하기]로 들어오면 첨부 추가 영역을 펼친 채 연다 */
  const [isAddOpenOnEnter, setIsAddOpenOnEnter] = useState(false);
  const {
    data: detail,
    isPending,
    isError,
    error,
  } = useCheckupDetail(ckupRcdSn);
  const { data: pets, isPending: isPetsPending } = usePets();

  if (isPending || isPetsPending) {
    return (
      <SubPageLayout {...LAYOUT_PROPS}>
        <PageSkeleton top={<SkeletonCard className="h-[345px]" />} tabs={4}>
          <SkeletonCard className="h-[735px]" />
        </PageSkeleton>
      </SubPageLayout>
    );
  }
  if (isError) {
    return (
      <SubPageLayout {...LAYOUT_PROPS}>
        <p role="alert" className="text-[#566465]">
          {error?.code === 'NOT_FOUND'
            ? '검진기록을 찾을 수 없어요'
            : '검진기록을 불러오지 못했어요. 잠시 뒤 다시 시도해 주세요'}
        </p>
      </SubPageLayout>
    );
  }

  const { checkup } = detail;
  const imagingCount = detail.attachments.filter(
    (attachment) => attachment.atchTypeCd === ATTACHMENT_IMAGE,
  ).length;
  const counts = {
    result:
      detail.bloodInspections.length +
      imagingCount +
      detail.etcInspections.length,
    attachments: detail.attachments.length,
    prescription: detail.prescriptions.length,
    prevention: detail.preventions.length,
  };
  /** 영수증 여러 마리 저장 뒤 들어온 경우 다른 반려동물의 기록으로 가는 링크 */
  const otherSavedCheckups = (state?.savedCheckups ?? []).filter(
    (saved) => saved.ckupRcdSn !== ckupRcdSn,
  );

  const selectTab = (key) => {
    setIsAddOpenOnEnter(false);
    setTabKey(key);
  };

  const goAttachments = () => {
    setIsAddOpenOnEnter(true);
    setTabKey('attachments');
  };

  return (
    <SubPageLayout {...LAYOUT_PROPS}>
      {otherSavedCheckups.length > 0 && (
        <p role="status" className="flex flex-wrap gap-x-4 gap-y-1">
          {otherSavedCheckups.map((saved) => (
            <Link
              key={saved.ckupRcdSn}
              to={generatePath(PATHS.HEALTH_CHECKUP_DETAIL, {
                ckupRcdSn: saved.ckupRcdSn,
              })}
              state={state}
              className="font-semibold text-brand-600 hover:underline hover:underline-offset-3"
            >
              {saved.petNm} 기록 보기
            </Link>
          ))}
        </p>
      )}

      <CheckupInfoCard checkup={checkup} pets={pets} />

      <div className="flex flex-col gap-5">
        <DetailTabs selectedKey={tabKey} counts={counts} onSelect={selectTab} />
        <div
          role="tabpanel"
          id={getPanelId(tabKey)}
          aria-labelledby={getTabId(tabKey)}
        >
          {tabKey === 'result' && (
            <div className={PANEL}>
              <ResultsTab detail={detail} onGoAttachments={goAttachments} />
            </div>
          )}
          {tabKey === 'attachments' && (
            <AttachmentTab
              ckupRcdSn={ckupRcdSn}
              attachments={detail.attachments}
              isAddOpenInitially={isAddOpenOnEnter}
            />
          )}
          {tabKey === 'prescription' && (
            <PrescriptionTab
              ckupRcdSn={ckupRcdSn}
              prescriptions={detail.prescriptions}
            />
          )}
          {tabKey === 'prevention' && (
            <PreventionTab
              ckupRcdSn={ckupRcdSn}
              preventions={detail.preventions}
            />
          )}
        </div>
      </div>
    </SubPageLayout>
  );
}
