import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useEffect } from 'react';
import { showToast } from '@/components/toastStore';
import { expenseKeys } from '@/features/expense/queries';
import { notificationKeys } from '@/features/notification/queries';
import { petKeys } from '@/features/pet/queries';
import { pointKeys } from '@/features/point/queries';
import {
  cancelCareRecord,
  cancelLastDose,
  checkCareItem,
  createCareItem,
  createSchedule,
  deleteCareItem,
  deleteSchedule,
  getCareItems,
  getCareMissionProgress,
  getMyPets,
  getPetDetail,
  getPetLimit,
  getSchedules,
  saveCareIndications,
  updateCareItem,
  updateSchedule,
} from './api';
import {
  analyzeLabPdf,
  bulkSavePrescriptions,
  cancelPrevention,
  createAttachment,
  createEtcInspection,
  createInspections,
  createPrescription,
  createPrevention,
  deleteAttachment,
  deleteEtcInspection,
  deleteInspections,
  deletePrescription,
  getCheckupAttachments,
  getEtcInspections,
  getInspectionValues,
  getPrescriptions,
  getRepeatPreventions,
  replaceAttachment,
  updateEtcInspection,
  updateInspection,
  updatePrescription,
} from './checkupApi';
import {
  createCheckup,
  createDailyRecord,
  createObservationCycle,
  createObservationItem,
  deleteCheckup,
  deleteDailyRecord,
  deleteObservationCycle,
  endObservationItem,
  findNearSchedule,
  getCheckup,
  getCheckupYears,
  getCheckups,
  getDailyRecords,
  getDailyTrend,
  getObservationCycles,
  getObservationItems,
  updateCheckup,
  updateDailyRecord,
  updateObservationCycle,
} from './diaryApi';
import {
  createReceiptCheckup,
  prepareReceiptSave,
  saveReceiptCheckups,
} from './receiptApi';
import {
  getHealthIndicators,
  getHealthReport,
  getHealthWidgets,
  getRecentStools,
  refreshHealthReport,
  removeOldHealthWidgets,
  saveHealthWidgets,
} from './dashboardApi';
import { getHealthSummary } from './summaryApi';

export const healthKeys = {
  all: ['health'],
  myPets: ['health', 'my-pets'],
  petDetail: (petSn) => ['health', 'my-pets', 'detail', petSn],
  schedules: ['health', 'schedules'],
  scheduleList: (params) => ['health', 'schedules', params],
  careItems: ['health', 'care-items'],
  careItemList: (petSn) => ['health', 'care-items', petSn],
  careMissions: ['health', 'care-missions'],
  careMissionProgress: (petSn) => ['health', 'care-missions', petSn],
  dailyRecords: ['health', 'daily-records'],
  dailyRecordList: (petSn) => ['health', 'daily-records', petSn],
  dailyTrend: (petSn, dailyRcdIdctCd) => [
    'health',
    'daily-records',
    petSn,
    'trend',
    dailyRcdIdctCd,
  ],
  observations: ['health', 'observations'],
  observationList: (petSn) => ['health', 'observations', petSn],
  observationCycles: (petSn, obsrvArtclSn) => [
    'health',
    'observations',
    petSn,
    'cycles',
    obsrvArtclSn,
  ],
  observationPhoto: (petSn, obsrvCyclSn) => [
    'health',
    'observations',
    petSn,
    'photo',
    obsrvCyclSn,
  ],
  receiptImage: (recptSn) => ['health', 'receipts', recptSn, 'image'],
  checkups: ['health', 'checkups'],
  checkupList: (params) => ['health', 'checkups', params],
  checkupYears: (petSn) => ['health', 'checkups', 'years', petSn],
  checkupDetail: (ckupRcdSn) => ['health', 'checkups', 'detail', ckupRcdSn],
  summary: (petSn) => ['health', 'summary', petSn],
  widgets: (mbrSn) => ['health', 'widgets', mbrSn],
  /** 일상 기록을 바꾸면 같이 다시 읽도록 daily-records 아래 */
  indicators: (petSn) => ['health', 'daily-records', petSn, 'indicators'],
  recentStools: (petSn) => ['health', 'daily-records', petSn, 'stools'],
  healthReport: (petSn) => ['health', 'health-report', petSn],
};

const showErrorToast = (error) => showToast(error.message, { type: 'error' });

/** 내 반려동물 목록(GET /pets) */
export const useMyPets = () =>
  useQuery({ queryKey: healthKeys.myPets, queryFn: getMyPets });

/** 반려동물 한도. 마이페이지에서 등록·삭제·수락하면 같이 갱신되게 petKeys.limit()를 쓴다 */
export const usePetLimit = () =>
  useQuery({ queryKey: petKeys.limit(), queryFn: getPetLimit });

/** 반려동물 상세(GET /pets/{petSn}), 체중 그래프 목표선용. isEnabled가 false면 요청하지 않는다 */
export const usePetDetail = (petSn, isEnabled) =>
  useQuery({
    queryKey: healthKeys.petDetail(petSn),
    queryFn: () => getPetDetail(petSn),
    enabled: isEnabled && petSn != null,
  });

/** params: { petSns, fromYmd, toYmd, size } */
export const useSchedules = (params) =>
  useQuery({
    queryKey: healthKeys.scheduleList(params),
    queryFn: () => getSchedules(params),
    enabled: params.petSns != null,
    placeholderData: keepPreviousData,
  });

const useScheduleMutation = (mutationFn) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    // 반려동물을 바꾼 병원 일정은 연동 케어 항목도 옮겨지므로 케어리스트도 다시 읽는다
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: healthKeys.schedules });
      queryClient.invalidateQueries({ queryKey: healthKeys.careItems });
      queryClient.invalidateQueries({ queryKey: healthKeys.checkups });
    },
    // 입력값 검증 오류는 모달 입력칸 아래에 표시
    onError: (error) => {
      if (!error.fields) showErrorToast(error);
    },
  });
};

export const useCreateSchedule = () => useScheduleMutation(createSchedule);

export const useUpdateSchedule = () => useScheduleMutation(updateSchedule);

export const useDeleteSchedule = () => useScheduleMutation(deleteSchedule);

export const useCareItems = (petSn) =>
  useQuery({
    queryKey: healthKeys.careItemList(petSn),
    queryFn: () => getCareItems(petSn),
    enabled: petSn != null,
  });

/** 케어 항목·오늘 케어미션 진행·포인트 미션 캐시 무효화 */
const invalidateCare = (queryClient) => {
  queryClient.invalidateQueries({ queryKey: healthKeys.careItems });
  queryClient.invalidateQueries({ queryKey: healthKeys.careMissions });
  queryClient.invalidateQueries({ queryKey: pointKeys.all });
};

const useCareMutation = (mutationFn, { hasErrorToast = true } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => invalidateCare(queryClient),
    onError: (error) => {
      if (hasErrorToast) showErrorToast(error);
    },
  });
};

/** 오늘 케어미션 완료 수·전체 수·주양육자 여부 (※신규 정책) */
export const useCareMissionProgress = (petSn) =>
  useQuery({
    queryKey: healthKeys.careMissionProgress(petSn),
    queryFn: () => getCareMissionProgress(petSn),
    enabled: petSn != null,
  });

export const useCheckCareItem = () => useCareMutation(checkCareItem);

export const useCancelLastDose = () => useCareMutation(cancelLastDose);

export const useCancelCareRecord = () => useCareMutation(cancelCareRecord);

export const useCreateCareItem = () => useCareMutation(createCareItem);

/** 튜토리얼의 케어리스트 항목 저장 (※신규 정책) */
export const useSaveCareIndications = () =>
  useCareMutation(saveCareIndications);

/**
 * 「케어 항목 관리」 저장: 생성 -> 수정 -> 고른 항목 저장 -> 삭제 (※신규 정책)
 * - done: 끝난 단계 기록. 다시 시도하면 남은 단계만 보냄
 */
const saveCareChanges = async ({ petSn, items, removedSns, done }) => {
  for (const item of items) {
    if (item.careArtclSn == null) {
      /** 새 항목: 이미 만들었으면 그 뒤 고친 값만 수정으로 반영 */
      const createdSn = done.createdSns[item.chipKey];
      const bodyKey = JSON.stringify(item.createBody);
      if (createdSn == null) {
        const created = await createCareItem({ petSn, body: item.createBody });
        done.createdSns[item.chipKey] = created.careArtclSn;
        done.updatedBodies[created.careArtclSn] = bodyKey;
      } else if (done.updatedBodies[createdSn] !== bodyKey) {
        await updateCareItem({
          petSn,
          careArtclSn: createdSn,
          body: { ...item.createBody, lastCmptnYmd: undefined },
        });
        done.updatedBodies[createdSn] = bodyKey;
      }
      continue;
    }
    const bodyKey = JSON.stringify(item.updateBody ?? {});
    if (bodyKey === '{}' || done.updatedBodies[item.careArtclSn] === bodyKey)
      continue;
    await updateCareItem({
      petSn,
      careArtclSn: item.careArtclSn,
      body: item.updateBody,
    });
    done.updatedBodies[item.careArtclSn] = bodyKey;
  }
  const careArtclSns = items
    .filter((item) => item.isOn)
    .map((item) => item.careArtclSn ?? done.createdSns[item.chipKey]);
  const indicationKey = careArtclSns.join(',');
  if (done.indicationKey !== indicationKey) {
    await saveCareIndications({ petSn, careArtclSns });
    done.indicationKey = indicationKey;
  }
  for (const careArtclSn of removedSns) {
    if (done.deletedSns.includes(careArtclSn)) continue;
    await deleteCareItem({ petSn, careArtclSn });
    done.deletedSns.push(careArtclSn);
  }
};

/** 오류는 모달 안에 표시 */
export const useSaveCareChanges = () =>
  useCareMutation(saveCareChanges, { hasErrorToast: false });

export const useDailyRecords = (petSn) =>
  useQuery({
    queryKey: healthKeys.dailyRecordList(petSn),
    queryFn: () => getDailyRecords({ petSn }),
    enabled: petSn != null,
    placeholderData: keepPreviousData,
  });

/** 건강기록 변화 그래프용 한 지표의 최근 기록 */
export const useDailyTrend = (petSn, dailyRcdIdctCd) =>
  useQuery({
    queryKey: healthKeys.dailyTrend(petSn, dailyRcdIdctCd),
    queryFn: () => getDailyTrend({ petSn, dailyRcdIdctCd }),
    enabled: petSn != null,
  });

const useDailyRecordMutation = (mutationFn) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: healthKeys.dailyRecords }),
    onError: showErrorToast,
  });
};

export const useCreateDailyRecord = () =>
  useDailyRecordMutation(createDailyRecord);

export const useUpdateDailyRecord = () =>
  useDailyRecordMutation(updateDailyRecord);

export const useDeleteDailyRecord = () =>
  useDailyRecordMutation(deleteDailyRecord);

/** 관찰 항목 목록. 회차는 선택한 항목만 useObservationCycles로 받는다 */
export const useObservationItems = (petSn) =>
  useQuery({
    queryKey: healthKeys.observationList(petSn),
    queryFn: () => getObservationItems({ petSn }),
    enabled: petSn != null,
    placeholderData: keepPreviousData,
  });

export const useObservationCycles = (petSn, obsrvArtclSn) =>
  useQuery({
    queryKey: healthKeys.observationCycles(petSn, obsrvArtclSn),
    queryFn: () => getObservationCycles({ petSn, obsrvArtclSn }),
    enabled: petSn != null && obsrvArtclSn != null,
  });

/** 사진은 회차 번호마다 바뀌지 않으므로 다시 받지 않는다(지운 회차 사진을 다시 받아 404가 나는 것도 막음) */
const isPhotoQuery = (query) => query.queryKey[3] === 'photo';

/** 항목·회차 목록을 다시 받는다. 사진은 사진을 바꾼 수정만 따로 다시 받는다 */
const invalidateObservations = (queryClient, isSkipped = () => false) =>
  queryClient.invalidateQueries({
    queryKey: healthKeys.observations,
    predicate: (query) => !isPhotoQuery(query) && !isSkipped(query),
  });

const useObservationMutation = (mutationFn) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => invalidateObservations(queryClient),
    onError: showErrorToast,
  });
};

export const useCreateObservationItem = () =>
  useObservationMutation(createObservationItem);

export const useCreateObservationCycle = () =>
  useObservationMutation(createObservationCycle);

/** 새 사진을 보냈으면 그 회차 사진도 다시 받는다 */
export const useUpdateObservationCycle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateObservationCycle,
    onSuccess: (_, { petSn, obsrvCyclSn, file }) => {
      invalidateObservations(queryClient);
      if (file) {
        queryClient.invalidateQueries({
          queryKey: healthKeys.observationPhoto(petSn, obsrvCyclSn),
        });
      }
    },
    onError: showErrorToast,
  });
};

/**
 * 지운 회차를 회차 목록 캐시에서 먼저 빼고 다시 받는다
 * - 마지막 회차였으면 항목도 사라지므로 그 항목의 회차 목록은 다시 받지 않는다(404 방지)
 * - variables: { petSn, obsrvArtclSn, obsrvCyclSn }
 */
export const useDeleteObservationCycle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteObservationCycle,
    onSuccess: (_, { petSn, obsrvArtclSn, obsrvCyclSn }) => {
      const cyclesKey = healthKeys.observationCycles(petSn, obsrvArtclSn);
      const remaining = queryClient.setQueryData(cyclesKey, (cycles) =>
        cycles?.filter((cycle) => cycle.obsrvCyclSn !== obsrvCyclSn),
      );
      const isItemDeleted = remaining?.length === 0;
      return invalidateObservations(
        queryClient,
        (query) =>
          isItemDeleted &&
          query.queryKey[3] === 'cycles' &&
          query.queryKey[4] === obsrvArtclSn,
      );
    },
    onError: showErrorToast,
  });
};

export const useEndObservationItem = () =>
  useObservationMutation(endObservationItem);

/** params: { petSn, year, ckupTypeCd, page, size } */
export const useCheckups = (params) =>
  useQuery({
    queryKey: healthKeys.checkupList(params),
    queryFn: () => getCheckups(params),
    enabled: params.petSn != null,
    placeholderData: keepPreviousData,
  });

export const useCheckupYears = (petSn) =>
  useQuery({
    queryKey: healthKeys.checkupYears(petSn),
    queryFn: () => getCheckupYears(petSn),
    enabled: petSn != null,
  });

/**
 * 검진기록 변경은 병원 일정·검진기록 수와 연동 케어 항목에 이어짐
 * onError: 모달 안에 오류를 보이는 곳은 null로 토스트를 끈다(열린 모달 뒤에 가려짐)
 */
const useCheckupMutation = (mutationFn, onError = showErrorToast) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: healthKeys.checkups });
      queryClient.invalidateQueries({ queryKey: healthKeys.schedules });
      queryClient.invalidateQueries({ queryKey: healthKeys.careItems });
    },
    onError,
  });
};

export const useCreateCheckup = () => useCheckupMutation(createCheckup);

/** 오류(409 RECEIPT_ALREADY_SAVED·404 RECEIPT_NOT_FOUND 등)는 검진기록 추가 모달 안에 보인다 */
export const useCreateReceiptCheckup = () =>
  useCheckupMutation(createReceiptCheckup, null);

/**
 * 검진기록 삭제: 지운 기록의 상세 캐시는 무효화하지 않고 지운다.
 * 무효화하면 화면을 떠나기 전에 지운 상세를 다시 불러 404·오류 화면이 잠깐 보인다
 */
export const useDeleteCheckup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCheckup,
    onSuccess: (_data, { ckupRcdSn }) => {
      const detailKey = healthKeys.checkupDetail(ckupRcdSn);
      queryClient.removeQueries({ queryKey: detailKey });
      queryClient.invalidateQueries({
        queryKey: healthKeys.checkups,
        predicate: (query) =>
          !(query.queryKey[2] === 'detail' && query.queryKey[3] === ckupRcdSn),
      });
      queryClient.invalidateQueries({ queryKey: healthKeys.schedules });
      queryClient.invalidateQueries({ queryKey: healthKeys.careItems });
    },
    onError: showErrorToast,
  });
};

export const useUpdateCheckup = () => useCheckupMutation(updateCheckup);

/** 검진상세 조회: 기본정보와 탭 목록 5개를 각각 조회 */
const CHECKUP_DETAIL_QUERIES = [
  ['checkup', getCheckup],
  ['bloodInspections', getInspectionValues],
  ['etcInspections', getEtcInspections],
  ['attachments', getCheckupAttachments],
  ['prescriptions', getPrescriptions],
  ['preventions', getRepeatPreventions],
];

/** 탭별 결과를 한 객체로: 바깥에 둬 결과가 그대로면 다시 만들지 않는다 */
const combineCheckupDetail = (results) => {
  const failed = results.find((result) => result.isError);
  const isPending = results.some((result) => result.isPending);
  return {
    data:
      isPending || failed
        ? undefined
        : Object.fromEntries(
            CHECKUP_DETAIL_QUERIES.map(([name], index) => [
              name,
              results[index].data,
            ]),
          ),
    isPending: !failed && isPending,
    isError: Boolean(failed),
    error: failed?.error ?? null,
  };
};

/**
 * 검진상세 한 번에: { checkup, bloodInspections, etcInspections, attachments, prescriptions, preventions }
 * - 탭 건수를 함께 보여 주므로 모두 받은 뒤 data를 채우고, 하나라도 실패하면 isError
 * - 반려동물을 옮기면 같은 검진기록도 주소의 petSn이 바뀌므로 키에 petSn을 넣는다. 무효화는 ckupRcdSn까지의 앞부분으로
 */
export const useCheckupDetail = ({ petSn, ckupRcdSn }) =>
  useQueries({
    queries: CHECKUP_DETAIL_QUERIES.map(([name, queryFn]) => ({
      queryKey: [...healthKeys.checkupDetail(ckupRcdSn), petSn, name],
      queryFn: () => queryFn({ petSn, ckupRcdSn }),
    })),
    combine: combineCheckupDetail,
  });

/** 검진상세 변경: 변수의 ckupRcdSn 상세를 다시 읽고, 케어 항목이 바뀌는 변경은 케어리스트도 재조회 */
const useCheckupDetailMutation = (
  mutationFn,
  { hasCareItems = false, onError = showErrorToast } = {},
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: healthKeys.checkupDetail(variables.ckupRcdSn),
      });
      if (hasCareItems) {
        queryClient.invalidateQueries({ queryKey: healthKeys.careItems });
      }
    },
    onError,
  });
};

export const useCreateAttachment = () =>
  useCheckupDetailMutation(createAttachment);

export const useReplaceAttachment = () =>
  useCheckupDetailMutation(replaceAttachment);

export const useDeleteAttachment = () =>
  useCheckupDetailMutation(deleteAttachment);

/** PDF 분석: 데이터를 바꾸지 않는 요청이라 무효화 없이 결과만 반환. 실패 안내는 검사 수치 입력 화면이 보인다 */
export const useAnalyzeLabPdf = () =>
  useMutation({ mutationFn: analyzeLabPdf });

export const useCreateInspections = () =>
  useCheckupDetailMutation(createInspections);

export const useUpdateInspection = () =>
  useCheckupDetailMutation(updateInspection);

export const useDeleteInspections = () =>
  useCheckupDetailMutation(deleteInspections);

export const useCreateEtcInspection = () =>
  useCheckupDetailMutation(createEtcInspection);

export const useUpdateEtcInspection = () =>
  useCheckupDetailMutation(updateEtcInspection);

export const useDeleteEtcInspection = () =>
  useCheckupDetailMutation(deleteEtcInspection);

export const useCreatePrescription = () =>
  useCheckupDetailMutation(createPrescription, { hasCareItems: true });

export const useUpdatePrescription = () =>
  useCheckupDetailMutation(updatePrescription, { hasCareItems: true });

/** 처방약 일괄 저장: 칸별 400 오류는 모달이 약마다 보여 주므로 토스트를 띄우지 않음 */
export const useBulkSavePrescriptions = () =>
  useCheckupDetailMutation(bulkSavePrescriptions, {
    hasCareItems: true,
    onError: (error) => {
      if (!error.fields) showErrorToast(error);
    },
  });

export const useDeletePrescription = () =>
  useCheckupDetailMutation(deletePrescription, { hasCareItems: true });

export const useCreatePrevention = () =>
  useCheckupDetailMutation(createPrevention, { hasCareItems: true });

export const useCancelPrevention = () =>
  useCheckupDetailMutation(cancelPrevention, { hasCareItems: true });

/** 저장 전 가까운 예정 일정 확인: 조회지만 저장 시점에 한 번만 부름 */
export const useFindNearSchedule = () =>
  useMutation({ mutationFn: findNearSchedule, onError: showErrorToast });

/** 종합 건강기록: 반려동물별로 한 번에. 화면을 열 때마다 다시 읽어 다른 화면에서 바꾼 값을 반영 */
export const useHealthSummary = (petSn) =>
  useQuery({
    queryKey: healthKeys.summary(petSn),
    queryFn: () => getHealthSummary(petSn),
    enabled: petSn != null,
  });

/**
 * 미리 요청한 결과를 카드가 다시 부르지 않는 시간: 기본(staleTime 0)이면 카드가 나중에 그려질 때 같은 요청이 또 나감.
 * 새로고침·저장은 setQueryData로 바로 바뀜
 */
const DASHBOARD_STALE_TIME = 5 * 60 * 1000;

/** 대시보드 고른 항목 조회 옵션: useHealthWidgets와 미리 요청이 같이 씀 */
const healthWidgetsQuery = (mbrSn) =>
  queryOptions({
    queryKey: healthKeys.widgets(mbrSn),
    queryFn: () => {
      removeOldHealthWidgets(mbrSn);
      return getHealthWidgets();
    },
    staleTime: DASHBOARD_STALE_TIME,
  });

/** AI 건강분석 리포트 조회 옵션: useHealthReport와 미리 요청이 같이 씀 */
const healthReportQuery = (petSn) =>
  queryOptions({
    queryKey: healthKeys.healthReport(petSn),
    queryFn: () => getHealthReport(petSn),
    staleTime: DASHBOARD_STALE_TIME,
    retry: false,
  });

/**
 * 종합 건강기록: 반려동물이 정해지면 AI 리포트·대시보드 고른 항목을 건강 요약과 함께 미리 요청
 * - 카드는 건강 요약·고른 항목이 끝난 뒤 그려져 요청이 맨 마지막에 나가던 것을 앞당김. 같은 키라 카드가 이 결과를 씀
 */
export const usePrefetchHealthDashboard = ({ petSn, mbrSn }) => {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (petSn != null) queryClient.prefetchQuery(healthReportQuery(petSn));
  }, [queryClient, petSn]);
  /** 0마리면 대시보드를 그리지 않으므로 부르지 않음 */
  const hasPet = petSn != null;
  useEffect(() => {
    if (hasPet && mbrSn != null) {
      queryClient.prefetchQuery(healthWidgetsQuery(mbrSn));
    }
  }, [queryClient, hasPet, mbrSn]);
};

/** 대시보드 고른 항목 id 배열(저장 순서). 저장한 적이 없으면 data가 null. 예전 브라우저 저장값은 이때 지움 */
export const useHealthWidgets = (mbrSn) =>
  useQuery({
    ...healthWidgetsQuery(mbrSn),
    enabled: mbrSn != null,
  });

/** 고른 항목 저장(mbrSn은 캐시 키용). 실패하면 서버 message 토스트 */
export const useSaveHealthWidgets = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveHealthWidgets,
    onSuccess: (widgetIds, { mbrSn }) =>
      queryClient.setQueryData(healthKeys.widgets(mbrSn), widgetIds),
    onError: showErrorToast,
  });
};

/** 체중·식사량·음수량·산책·크레아티닌 지표 */
export const useHealthIndicators = (petSn) =>
  useQuery({
    queryKey: healthKeys.indicators(petSn),
    queryFn: () => getHealthIndicators(petSn),
    enabled: petSn != null,
  });

/**
 * AI 건강분석 리포트. 실패는 카드 안에서 [다시 시도]
 * - 저절로 다시 부르지 않음: 시간 초과(504)는 LLM을 다시 부르는 비용이 든다
 */
export const useHealthReport = (petSn) =>
  useQuery({
    ...healthReportQuery(petSn),
    enabled: petSn != null,
  });

/** AI 건강분석 리포트 새로고침. 성공하면 받은 리포트로 바꾸고, 실패 안내는 카드 안에서 */
export const useRefreshHealthReport = (petSn) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => refreshHealthReport(petSn),
    onSuccess: (report) =>
      queryClient.setQueryData(healthKeys.healthReport(petSn), report),
  });
};

/** 배변 상태 카드용 최근 기록 */
export const useRecentStools = (petSn, isEnabled) =>
  useQuery({
    queryKey: healthKeys.recentStools(petSn),
    queryFn: () => getRecentStools(petSn),
    enabled: isEnabled && petSn != null,
  });

/** 저장 전 가계부 중복·가까운 예정 일정 확인. 실패 안내는 모달 안에서 처리 */
export const usePrepareReceiptSave = () =>
  useMutation({ mutationFn: prepareReceiptSave });

/** 영수증으로 검진기록 저장. 실패하면 입력값을 유지한 채 모달 안에서 재시도 */
export const useSaveReceiptCheckups = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveReceiptCheckups,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: healthKeys.checkups });
      queryClient.invalidateQueries({ queryKey: healthKeys.schedules });
      queryClient.invalidateQueries({ queryKey: healthKeys.careItems });
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
      /** 영수증 저장 시 서버가 가계부 지출을 만들고 한도 초과 알림을 저장하므로 알림 개수·목록 재조회 */
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount });
      queryClient.invalidateQueries({ queryKey: notificationKeys.list });
    },
  });
};
