import { RECEIPT_ACCEPT, validateReceiptFile } from '@/utils/receiptFile';

/**
 * [AI 대화 첨부 파일 규칙] 대화창 입력(ChatInput)·메인 검색창(HeroAsk) 공용
 * - 사진(jpg·jpeg·png·webp)은 영수증 업로드와 같은 검사, PDF는 검사결과지 분석(SCR-AIM-013, 계약 2026-11-23)
 * - 계약: ai 저장소 docs/api/chat.md ImageIntentRequest (10MB, 확장자와 실제 형식이 같아야 함)
 */

const MAX_BYTES = 10 * 1024 * 1024;
/** PDF 시그니처 `%PDF-` */
const PDF_SIGNATURE = [0x25, 0x50, 0x44, 0x46, 0x2d];

export const CHAT_ATTACH_ACCEPT = `${RECEIPT_ACCEPT},.pdf`;
export const CHAT_ATTACH_HELP = 'jpg·jpeg·png·webp·pdf · 1개 10MB 이하';

const UNSUPPORTED =
  '지원하지 않는 형식이에요. jpg·jpeg·png·webp 이미지나 PDF를 올려 주세요';
const TOO_LARGE = '용량이 너무 커요. 10MB 이하 파일을 올려 주세요';

/** 확장자가 PDF인지 */
export const isPdfFile = (file) =>
  file.name.split('.').pop().toLowerCase() === 'pdf';

/** 첨부 가능 여부: 문제가 있으면 안내 문구, 없으면 null */
export const validateChatAttachment = async (file) => {
  if (file.size > MAX_BYTES) return TOO_LARGE;
  if (!isPdfFile(file)) {
    return (await validateReceiptFile(file)) ? UNSUPPORTED : null;
  }
  const header = new Uint8Array(
    await file.slice(0, PDF_SIGNATURE.length).arrayBuffer(),
  );
  return PDF_SIGNATURE.every((byte, i) => header[i] === byte)
    ? null
    : UNSUPPORTED;
};
