import {
  keepPreviousData,
  useMutation,
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
  deleteSchedule,
  getCareItems,
  getPets,
  getSchedules,
  toggleCareMain,
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
  getCheckupDetail,
  replaceAttachment,
  updateEtcInspection,
  updateInspection,
  updatePrescription,
} from './checkupApi';
import {
  createCheckup,
  createDailyRecord,
  createObservation,
  createObservationRound,
  deleteCheckup,
  deleteDailyRecord,
  deleteObservationRound,
  endObservation,
  findNearSchedule,
  getCheckups,
  getDailyRecords,
  getObservations,
  updateCheckup,
  updateDailyRecord,
  updateObservationRound,
} from './diaryApi';
import { prepareReceiptSave, saveReceiptCheckups } from './receiptApi';
import { getHealthSummary } from './summaryApi';

export const healthKeys = {
  all: ['health'],
  pets: ['health', 'pets'],
  schedules: ['health', 'schedules'],
  scheduleList: (params) => ['health', 'schedules', params],
  careItems: ['health', 'care-items'],
  careItemList: (petSn) => ['health', 'care-items', petSn],
  dailyRecords: ['health', 'daily-records'],
  dailyRecordList: (petSn) => ['health', 'daily-records', petSn],
  observations: ['health', 'observations'],
  observationList: (petSn) => ['health', 'observations', petSn],
  checkups: ['health', 'checkups'],
  checkupList: (params) => ['health', 'checkups', params],
  checkupDetail: (ckupRcdSn) => ['health', 'checkups', 'detail', ckupRcdSn],
  summary: (petSn) => ['health', 'summary', petSn],
};

const showErrorToast = (error) => showToast(error.message);

export const usePets = () =>
  useQuery({ queryKey: healthKeys.pets, queryFn: getPets });

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
    onError: showErrorToast,
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

export const useToggleCareMain = () => useCareMutation(toggleCareMain);

export const useCreateCareItem = () => useCareMutation(createCareItem);

export const useDailyRecords = (petSn) =>
  useQuery({
    queryKey: healthKeys.dailyRecordList(petSn),
    queryFn: () => getDailyRecords({ petSn }),
    enabled: petSn != null,
    placeholderData: keepPreviousData,
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

export const useObservations = (petSn) =>
  useQuery({
    queryKey: healthKeys.observationList(petSn),
    queryFn: () => getObservations({ petSn }),
    enabled: petSn != null,
    placeholderData: keepPreviousData,
  });

const useObservationMutation = (mutationFn) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: healthKeys.observations }),
    onError: showErrorToast,
  });
};

export const useCreateObservation = () =>
  useObservationMutation(createObservation);

export const useCreateObservationRound = () =>
  useObservationMutation(createObservationRound);

export const useUpdateObservationRound = () =>
  useObservationMutation(updateObservationRound);

export const useDeleteObservationRound = () =>
  useObservationMutation(deleteObservationRound);

export const useEndObservation = () => useObservationMutation(endObservation);

/** params: { petSn, year } */
export const useCheckups = (params) =>
  useQuery({
    queryKey: healthKeys.checkupList(params),
    queryFn: () => getCheckups(params),
    enabled: params.petSn != null,
    placeholderData: keepPreviousData,
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

/** 검진상세 한 번에: 검진기록·검사 결과·첨부 자료·처방약·반복 예방 */
export const useCheckupDetail = (ckupRcdSn) =>
  useQuery({
    queryKey: healthKeys.checkupDetail(ckupRcdSn),
    queryFn: () => getCheckupDetail(ckupRcdSn),
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
