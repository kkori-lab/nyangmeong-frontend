import { aiApi, api } from '@/api/axios';
import { ATTACHMENT_IMAGE } from './checkup/checkupTypes';

/**
 * [검진상세 API]
 * - 검진상세 조회와 첨부·기타검사·처방약·반복 예방·혈액검사 저장·수정·삭제는 실제 API(JAJ 백엔드)
 * - 검사결과지 PDF 분석은 AI 서버(LJS, nyangmeong-ai)
 */

/** 첨부 목록은 첫 페이지 50건(서버 최대, 페이지는 1부터)만 받고 넘기지 않는다 */
const ATTACHMENT_PAGE_SIZE = 50;

/** 검진상세 탭별 조회: 목록 API는 모두 검진기록 번호(ckupRcdSn)가 필요하다 */

export const getInspectionValues = ({ petSn, ckupRcdSn }) =>
  api.get(`/pets/${petSn}/inspection-values`, { params: { ckupRcdSn } });

export const getEtcInspections = ({ petSn, ckupRcdSn }) =>
  api.get(`/pets/${petSn}/etc-inspections`, { params: { ckupRcdSn } });

/** 첨부는 Page 응답이라 content만 쓴다 */
export const getCheckupAttachments = ({
  petSn,
  ckupRcdSn,
  size = ATTACHMENT_PAGE_SIZE,
}) =>
  api
    .get(`/pets/${petSn}/checkup-attachments`, {
      params: { ckupRcdSn, page: 1, size },
    })
    .then((page) => page.content);

/** 복용중이 먼저 오는 서버 순서 그대로 */
export const getPrescriptions = ({ petSn, ckupRcdSn }) =>
  api.get(`/pets/${petSn}/prescriptions`, { params: { ckupRcdSn } });

export const getRepeatPreventions = ({ petSn, ckupRcdSn }) =>
  api.get(`/pets/${petSn}/repeat-preventions`, { params: { ckupRcdSn } });

/** 첨부 자료: 영상 사진이 아니면 영상 종류·촬영 부위는 보내지 않는다 */

export const createAttachment = ({
  petSn,
  ckupRcdSn,
  atchTypeCd,
  file,
  imgKndCd,
  shtRegnCd,
}) => {
  const body = new FormData();
  body.append('ckupRcdSn', ckupRcdSn);
  body.append('file', file);
  body.append('atchTypeCd', atchTypeCd);
  if (atchTypeCd === ATTACHMENT_IMAGE) {
    body.append('imgKndCd', imgKndCd);
    body.append('shtRegnCd', shtRegnCd);
  }
  return api.post(`/pets/${petSn}/checkup-attachments`, body);
};

/** 교체는 파일 1건만 대체: 유형·영상 종류·촬영 부위는 보내지 않아 그대로 */
export const replaceAttachment = ({ petSn, ckupRcdAtchSn, file }) => {
  const body = new FormData();
  body.append('file', file);
  return api.patch(`/pets/${petSn}/checkup-attachments/${ckupRcdAtchSn}`, body);
};

export const deleteAttachment = ({ petSn, ckupRcdAtchSn }) =>
  api.delete(`/pets/${petSn}/checkup-attachments/${ckupRcdAtchSn}`);

/** 첨부 원본 파일(Blob): 다운로드·PDF 열기용 */
export const getAttachmentFile = ({ petSn, ckupRcdAtchSn }) =>
  api.get(`/pets/${petSn}/checkup-attachments/${ckupRcdAtchSn}`, {
    responseType: 'blob',
  });

/**
 * 검사결과지 PDF 분석: 첨부 원본을 받아 그대로 올린다
 * - 응답 items[]는 저장 요청과 같은 키, excludedArtclNms[]는 혈액검사가 아니라 뺀 항목 이름
 * - 오류: NOT_LAB_RESULT(422)·PDF_ANALYZE_TIMEOUT(504)·PDF_ANALYZE_API_ERROR(502)
 */
export const analyzeLabPdf = async ({ petSn, ckupRcdAtchSn, fileNm }) => {
  const blob = await getAttachmentFile({ petSn, ckupRcdAtchSn });
  const body = new FormData();
  body.append('file', blob, fileNm);
  return aiApi.post('/checkups/lab-results', body);
};

/** 검사 결과 */

/** 혈액검사 여러 건 저장(수동 추가 1건 또는 PDF 분석 결과). 같은 검진기록에 이미 있는 항목은 서버가 빼고, 실제 저장된 행만 돌려준다 */
export const createInspections = ({ petSn, ckupRcdSn, values }) =>
  api.post(`/pets/${petSn}/inspection-values`, { ckupRcdSn, values });

/**
 * 저장된 행을 갱신: 검사 항목은 바꾸지 않고 결과값·단위·참고범위·메모만
 * - 참고범위는 `refRange` 묶음으로 보낸다. 안 보내면 유지, 둘 다 null이면 비운다
 * - 함께 넘어오는 ckupRcdSn은 캐시 무효화용이라 본문에 넣지 않는다
 */
export const updateInspection = ({
  petSn,
  inspNvlSn,
  rsltNvl,
  unitNm,
  refLlmtNvl,
  refUplmtNvl,
  memoCn,
}) =>
  api.patch(`/pets/${petSn}/inspection-values/${inspNvlSn}`, {
    rsltNvl,
    unitNm,
    refRange: { refLlmtNvl, refUplmtNvl },
    memoCn,
  });

/** 선택한 혈액검사 행 삭제: inspNvlSn=1&inspNvlSn=2 형태로 보낸다 */
export const deleteInspections = ({ petSn, inspNvlSns }) =>
  api.delete(`/pets/${petSn}/inspection-values`, {
    params: { inspNvlSn: inspNvlSns },
    paramsSerializer: { indexes: null },
  });

/** 기타검사 */

export const createEtcInspection = ({ petSn, ...body }) =>
  api.post(`/pets/${petSn}/etc-inspections`, body);

export const updateEtcInspection = ({ petSn, etcInspSn, ...body }) =>
  api.patch(`/pets/${petSn}/etc-inspections/${etcInspSn}`, body);

export const deleteEtcInspection = ({ petSn, etcInspSn }) =>
  api.delete(`/pets/${petSn}/etc-inspections/${etcInspSn}`);

/** 처방약: 투약 케어 항목은 서버가 주기 체크(careRfltYn)·복용 상태에 맞춰 만들고 지운다 */

export const createPrescription = ({ petSn, ...body }) =>
  api.post(`/pets/${petSn}/prescriptions`, body);

export const updatePrescription = ({ petSn, prscSn, ...body }) =>
  api.patch(`/pets/${petSn}/prescriptions/${prscSn}`, body);

export const deletePrescription = ({ petSn, prscSn }) =>
  api.delete(`/pets/${petSn}/prescriptions/${prscSn}`);

/** 반복 예방: 정기관리 케어 항목은 서버가 만들고 지운다 */

export const createPrevention = ({ petSn, ...body }) =>
  api.post(`/pets/${petSn}/repeat-preventions`, body);

export const cancelPrevention = ({ petSn, reptPrvntMngSn }) =>
  api.delete(`/pets/${petSn}/repeat-preventions/${reptPrvntMngSn}`);
