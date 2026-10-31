import { useEffect, useState } from 'react';
import {
  generatePath,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import PageSkeleton from '@/components/PageSkeleton';
import SkeletonCard from '@/components/SkeletonCard';
import { useChatReceiptResult } from '@/features/ai/queries';
import ReceiptUploadModal from '@/features/ai/receipt/ReceiptUploadModal';
import {
  CHAT_RECEIPT_LOAD_ERROR,
  getChatReceiptFailure,
} from '@/features/ai/receipt/receiptFailure';
import CheckupListCard from '@/features/health/diary/CheckupListCard';
import CheckupModal from '@/features/health/diary/CheckupModal';
import DailyTrendCard from '@/features/health/diary/DailyTrendCard';
import DiaryPetBar from '@/features/health/diary/DiaryPetBar';
import ObservationCard from '@/features/health/diary/ObservationCard';
import ReceiptResultStep from '@/features/health/diary/ReceiptResultStep';
import RecentRecordTable from '@/features/health/diary/RecentRecordTable';
import TodayRecordCard from '@/features/health/diary/TodayRecordCard';
import TodayRecordForm from '@/features/health/diary/TodayRecordForm';
import { MEAL } from '@/features/health/diaryTypes';
import {
  useDailyRecords,
  useMyPets,
  useObservations,
} from '@/features/health/queries';
import SubPageLayout from '@/layouts/SubPageLayout';
import { showToast } from '@/components/toastStore';
import { PATHS } from '@/routes/paths';
import { getTodayYmd } from '@/utils/formatDate';

/** 공용 페이지 머리·사이드 메뉴 설정 */
const LAYOUT_PROPS = {
  section: 'health',
  description: '일상 기록과 지속 관찰, 검진기록을 한곳에서 남기고 확인해요',
  contentClassName: 'gap-7 tabular-nums antialiased min-[1101px]:pt-6',
};

const SECTION_TABS = [
  { id: 'hlt002-graph', label: '건강기록 변화' },
  { id: 'hlt002-obs', label: '지속 관찰' },
  { id: 'hlt002-exam', label: '검진기록' },
];

/** 종합 건강기록 등에서 #hlt002-obs·#hlt002-exam으로 오면 그 탭으로 시작 */
const getTabFromHash = (hash) =>
  SECTION_TABS.find((tab) => tab.id === hash.slice(1))?.id ??
  SECTION_TABS[0].id;

export default function HealthDiaryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { hash } = location;
  const [searchParams, setSearchParams] = useSearchParams();
  /** 지속 관찰 모바일 상세 화면으로 연 항목. 주소에 남겨 브라우저 뒤로 가기로 목록에 복귀 */
  const openObsvSn = Number(searchParams.get('obsv')) || null;
  const openObservation = (obsvItmSn) =>
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('obsv', String(obsvItmSn));
        return next;
      },
      { state: { isObsvFromList: true } },
    );
  /** 목록에서 연 상세면 뒤로 가기와 같게, 주소로 바로 들어왔으면 쿼리만 삭제 */
  const closeObservation = () => {
    if (location.state?.isObsvFromList) {
      navigate(-1);
      return;
    }
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('obsv');
        return next;
      },
      { replace: true },
    );
  };
  const todayYmd = getTodayYmd();
  const [tabPetSn, setTabPetSn] = useState(null);
  /** 반려동물을 바꾸면 다른 반려동물의 관찰 항목 번호가 주소에 남지 않게 삭제 */
  const selectPet = (petSn) => {
    setTabPetSn(petSn);
    if (openObsvSn === null) return;
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('obsv');
        return next;
      },
      { replace: true },
    );
  };
  const [sectionId, setSectionId] = useState(() => getTabFromHash(hash));
  /** 오늘 기록하기 입력 영역: null이면 닫힘, token으로 같은 영역을 다른 종류로 다시 엶 */
  const [recordForm, setRecordForm] = useState(null);
  /**
   * 영수증으로 검진기록 등록 흐름: null이면 닫힘
   * { step: 'upload' } 업로드(LJS) → { step: 'result', result } 인식 결과 확인
   * 인식 실패 뒤 직접 입력은 { step: 'manual', rcptSn }
   * features/health는 features/ai를 import 할 수 없어 두 도메인을 이 페이지가 연결
   * AI 대화창(SCR-AIM-013) [직접 입력]은 ?checkup=manual&recptSn=으로 와서 빈 폼으로 시작,
   *   [확인 후 저장]은 ?recptSn=&petSn=으로 와서 인식 결과를 받은 뒤 결과 확인으로 시작
   */
  const [receiptFlow, setReceiptFlow] = useState(() =>
    searchParams.get('checkup') === 'manual'
      ? {
          step: 'manual',
          rcptSn: Number(searchParams.get('recptSn')) || undefined,
        }
      : null,
  );
  /** [확인 후 저장]으로 온 영수증 번호와 진입 반려동물 */
  const [chatReceiptQuery] = useState(() =>
    searchParams.has('checkup')
      ? {}
      : {
          recptSn: Number(searchParams.get('recptSn')) || undefined,
          petSn: Number(searchParams.get('petSn')) || undefined,
        },
  );
  const { data: chatReceipt, isError: isChatReceiptError } =
    useChatReceiptResult(chatReceiptQuery);
  useEffect(() => {
    if (!chatReceipt) return;
    const { recptSn, petSn, ocr } = chatReceipt;
    if (!ocr) {
      showToast(getChatReceiptFailure(chatReceipt));
      return;
    }
    /* eslint-disable-next-line react-hooks/set-state-in-effect -- 인식 결과가 도착한 시점에 한 번 열기 */
    setReceiptFlow({ step: 'result', result: { recptSn, petSn, ocr } });
  }, [chatReceipt]);
  /** 없는·남의 영수증(404)·양육하지 않는 반려동물(403) 등은 모달 없이 안내 */
  useEffect(() => {
    if (isChatReceiptError) showToast(CHAT_RECEIPT_LOAD_ERROR);
  }, [isChatReceiptError]);
  /** 대화창에서 연 모달은 한 번만: 새로고침 때 다시 열리지 않게 쿼리 제거 */
  useEffect(() => {
    if (!searchParams.has('checkup') && !searchParams.has('recptSn')) return;
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('checkup');
        next.delete('recptSn');
        next.delete('petSn');
        return next;
      },
      { replace: true },
    );
    /* eslint-disable-next-line react-hooks/exhaustive-deps -- 첫 진입 때 한 번만 */
  }, []);

  const {
    data: pets,
    isPending: isPetsPending,
    isError: isPetsError,
  } = useMyPets();
  const selectedPetSn = tabPetSn ?? pets?.[0]?.petSn ?? null;
  const { data: recordData, isPending: isRecordsPending } =
    useDailyRecords(selectedPetSn);
  const { isPending: isObservationsPending } = useObservations(selectedPetSn);

  /** 첫 진입: 칩·탭까지 대시보드 틀 스켈레톤 */
  const isFirstLoading =
    isPetsPending ||
    (selectedPetSn !== null && (isRecordsPending || isObservationsPending));
  if (isFirstLoading)
    return (
      <SubPageLayout {...LAYOUT_PROPS}>
        <PageSkeleton chips={pets?.length || 3} tabs={SECTION_TABS.length}>
          <div className="grid gap-5 min-[1101px]:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
            <SkeletonCard className="h-[485px] max-[760px]:h-[424px]" />
            <SkeletonCard className="h-[485px] max-[760px]:h-[498px]" />
          </div>
          <SkeletonCard className="h-[886px] max-[760px]:h-[1095px]" />
          <SkeletonCard className="h-[943px] max-[760px]:h-[1423px]" />
          <SkeletonCard className="h-[1145px] max-[760px]:h-[1437px]" />
        </PageSkeleton>
      </SubPageLayout>
    );
  if (isPetsError) {
    return (
      <SubPageLayout {...LAYOUT_PROPS}>
        <p role="alert" className="text-[#566465]">
          반려동물 정보를 불러오지 못했어요. 잠시 뒤 다시 시도해 주세요
        </p>
      </SubPageLayout>
    );
  }

  const selectedPet = pets.find((pet) => pet.petSn === selectedPetSn);
  const records = recordData?.content ?? [];

  const openRecordForm = (typeCd) =>
    setRecordForm({ typeCd, token: Date.now() });

  /**
   * 저장 뒤 검진상세로: 여러 마리면 보던 반려동물(탭에 없으면 첫 탭)의 검진기록으로 이동하고
   * 다른 반려동물의 기록도 있다고 안내. 그 기록으로 가는 링크는 검진상세(SCR-HLT-005)가 state로 받아 연결
   */
  const handleReceiptSaved = (saved) => {
    const target =
      saved.find((item) => item.petSn === selectedPetSn) ?? saved[0];
    const other = saved.find((item) => item !== target);
    setReceiptFlow(null);
    if (other) {
      showToast(
        `${saved.map((item) => item.petNm).join('·')} ${saved.length}마리 검진기록을 저장했어요 · ${other.petNm} 기록 보기`,
      );
    }
    navigate(
      generatePath(PATHS.HEALTH_CHECKUP_DETAIL, {
        petSn: target.petSn,
        ckupRcdSn: target.ckupRcdSn,
      }),
      { state: { savedCheckups: saved } },
    );
  };

  return (
    <SubPageLayout {...LAYOUT_PROPS}>
      <DiaryPetBar
        pets={pets}
        selectedPetSn={selectedPetSn}
        onSelectPet={selectPet}
        tabs={SECTION_TABS}
        activeTabId={sectionId}
        onSelectTab={setSectionId}
      />

      {selectedPet && sectionId === 'hlt002-graph' && (
        <div
          id="hlt002-graph"
          role="tabpanel"
          aria-labelledby="hlt002-graph-tab"
          className="flex min-w-0 flex-col gap-7"
        >
          <div className="grid items-stretch gap-5 min-[1101px]:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
            <DailyTrendCard
              pet={selectedPet}
              records={records}
              onAddRecord={openRecordForm}
            />
            <TodayRecordCard
              records={records}
              todayYmd={todayYmd}
              isFormOpen={recordForm !== null}
              onToggleForm={() =>
                recordForm ? setRecordForm(null) : openRecordForm(MEAL)
              }
            />
          </div>

          {recordForm && (
            <TodayRecordForm
              key={recordForm.token}
              petSn={selectedPet.petSn}
              initialTypeCd={recordForm.typeCd}
            />
          )}

          <RecentRecordTable records={records} todayYmd={todayYmd} />
        </div>
      )}

      {selectedPet && sectionId === 'hlt002-obs' && (
        <div id="hlt002-obs" role="tabpanel" aria-labelledby="hlt002-obs-tab">
          <ObservationCard
            key={selectedPet.petSn}
            petSn={selectedPet.petSn}
            openItmSn={openObsvSn}
            onOpenItem={openObservation}
            onCloseItem={closeObservation}
          />
        </div>
      )}
      {selectedPet && sectionId === 'hlt002-exam' && (
        <div id="hlt002-exam" role="tabpanel" aria-labelledby="hlt002-exam-tab">
          <CheckupListCard
            key={selectedPet.petSn}
            pet={selectedPet}
            pets={pets}
            onReceipt={() => setReceiptFlow({ step: 'upload' })}
          />
        </div>
      )}

      {receiptFlow?.step === 'upload' && (
        <ReceiptUploadModal
          pets={pets}
          defaultPetSn={selectedPetSn}
          onRecognized={(result) => setReceiptFlow({ step: 'result', result })}
          onManualInput={({ rcptSn } = {}) =>
            setReceiptFlow({ step: 'manual', rcptSn })
          }
          onClose={() => setReceiptFlow(null)}
        />
      )}
      {receiptFlow?.step === 'result' && (
        <ReceiptResultStep
          result={receiptFlow.result}
          pets={pets}
          onRetake={() => setReceiptFlow({ step: 'upload' })}
          onSaved={handleReceiptSaved}
          onClose={() => setReceiptFlow(null)}
        />
      )}
      {receiptFlow?.step === 'manual' && (
        <CheckupModal
          pets={pets}
          defaultPetSn={selectedPetSn}
          initialStep="form"
          onClose={() => setReceiptFlow(null)}
        />
      )}
    </SubPageLayout>
  );
}
