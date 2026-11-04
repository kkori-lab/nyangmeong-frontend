import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  getAdminCharacterJobs,
  getAdminPdfAnalyses,
  getAdminReceipts,
  getOcrStatuses,
} from './api';

export const adminProcessingKeys = {
  all: ['adminProcessing'],
  receipts: (params) => ['adminProcessing', 'receipts', params],
  receiptImage: (recptSn) => ['adminProcessing', 'receiptImage', recptSn],
  characterJobs: (params) => ['adminProcessing', 'characterJobs', params],
  pdfAnalyses: (params) => ['adminProcessing', 'pdfAnalyses', params],
  ocrStatuses: ['adminProcessing', 'ocrStatuses'],
};

export const useAdminReceipts = (params) =>
  useQuery({
    queryKey: adminProcessingKeys.receipts(params),
    queryFn: () => getAdminReceipts(params),
    placeholderData: keepPreviousData,
  });

export const useAdminCharacterJobs = (params) =>
  useQuery({
    queryKey: adminProcessingKeys.characterJobs(params),
    queryFn: () => getAdminCharacterJobs(params),
    placeholderData: keepPreviousData,
  });

export const useAdminPdfAnalyses = (params) =>
  useQuery({
    queryKey: adminProcessingKeys.pdfAnalyses(params),
    queryFn: () => getAdminPdfAnalyses(params),
    placeholderData: keepPreviousData,
  });

/** 영수증 상태 이름은 SQL로만 바뀌어 오래 둔다 */
export const useOcrStatuses = () =>
  useQuery({
    queryKey: adminProcessingKeys.ocrStatuses,
    queryFn: getOcrStatuses,
    staleTime: Infinity,
  });
