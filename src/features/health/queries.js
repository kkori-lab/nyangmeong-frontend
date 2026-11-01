import {
  keepPreviousData,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { showToast } from '@/components/toastStore';
import {
  cancelCareRecord,
  cancelLastDose,
  checkCareItem,
  createCareItem,
  createSchedule,
  deleteCareItem,
  deleteSchedule,
  getCareItems,
  getMyPets,
  getSchedules,
  saveCareMain,
  updateCareItem,
  updateSchedule,
} from './api';
import {
  analyzeLabPdf,
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
import { prepareReceiptSave, saveReceiptCheckups } from './receiptApi';
import { getHealthSummary } from './summaryApi';

export const healthKeys = {
  all: ['health'],
  myPets: ['health', 'my-pets'],
  schedules: ['health', 'schedules'],
  scheduleList: (params) => ['health', 'schedules', params],
  careItems: ['health', 'care-items'],
  careItemList: (petSn) => ['health', 'care-items', petSn],
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
  checkups: ['health', 'checkups'],
  checkupList: (params) => ['health', 'checkups', params],
  checkupYears: (petSn) => ['health', 'checkups', 'years', petSn],
  checkupDetail: (ckupRcdSn) => ['health', 'checkups', 'detail', ckupRcdSn],
  summary: (petSn) => ['health', 'summary', petSn],
};

const showErrorToast = (error) => showToast(error.message);

/** 내 반려동물 목록(GET /pets) */
export const useMyPets = () =>
  useQuery({ queryKey: healthKeys.myPets, queryFn: getMyPets });

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

const useCareMutation = (mutationFn) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: healthKeys.careItems }),
    onError: showErrorToast,
  });
};

export const useCheckCareItem = () => useCareMutation(checkCareItem);

export const useCancelLastDose = () => useCareMutation(cancelLastDose);

export const useCancelCareRecord = () => useCareMutation(cancelCareRecord);

export const useSaveCareMain = () => useCareMutation(saveCareMain);

export const useCreateCareItem = () => useCareMutation(createCareItem);

/** 수정·삭제 UI는 화면설계서 갱신 뒤 따로 만든다 */
export const useUpdateCareItem = () => useCareMutation(updateCareItem);

export const useDeleteCareItem = () => useCareMutation(deleteCareItem);

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

/** 검진기록 변경은 병원 일정·검진기록 수와 연동 케어 항목에 이어짐 */
const useCheckupMutation = (mutationFn) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: healthKeys.checkups });
      queryClient.invalidateQueries({ queryKey: healthKeys.schedules });
      queryClient.invalidateQueries({ queryKey: healthKeys.careItems });
    },
    onError: showErrorToast,
  });
};

export const useCreateCheckup = () => useCheckupMutation(createCheckup);

export const useDeleteCheckup = () => useCheckupMutation(deleteCheckup);

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
  { hasCareItems = false } = {},
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
    onError: showErrorToast,
  });
};

export const useCreateAttachment = () =>
  useCheckupDetailMutation(createAttachment);

export const useReplaceAttachment = () =>
  useCheckupDetailMutation(replaceAttachment);

export const useDeleteAttachment = () =>
  useCheckupDetailMutation(deleteAttachment);

/** PDF 분석: 데이터를 바꾸지 않는 요청이라 무효화 없이 결과만 반환 */
export const useAnalyzeLabPdf = () =>
  useMutation({ mutationFn: analyzeLabPdf, onError: showErrorToast });

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
    },
  });
};
