import { ADMIN_TABLE_BOX } from '@/components/adminTableStyles';
const COLUMNS = ['알림 유형', '채널', '제목', '사용', ''];
const CELL = 'px-4 py-2 max-[760px]:px-1.5';
/** 행 안 작은 버튼: BTN_SECONDARY와 같은 색, 높이·여백만 작게 */
const ROW_BUTTON =
  'inline-flex h-9 items-center justify-center rounded-md border border-line bg-white px-3 text-sm font-semibold hover:border-line-strong hover:bg-surface-2 max-[760px]:h-8 max-[760px]:px-2';

/** 템플릿을 쓰는 알림 유형: 케어 일정만(서버 NotificationTemplateType과 같음), 나머지는 기본 문구로만 보낸다 */
const TEMPLATE_TYPE_CDS = ['AIMC0008'];

/** 사용 칸 글자: 템플릿 없음·사용 안 함은 기본 문구로 보낸다 */
const getUseLabel = (template) => {
  if (!template) return '기본 문구';
  return template.useYn ? '사용' : '미사용 (기본 문구)';
};

/**
 * [알림 템플릿 목록 표]
 * - rows: [{ type, channel, template }] 유형 × 채널. type·channel은 공통코드 { comCd, comCdNm }, template은 없으면 null
 * - 템플릿 있는 행은 [수정], 없는 행은 [등록] -> onEdit(row). 템플릿을 쓰지 않는 유형은 버튼 없음
 */
export default function TemplateTable({ rows, onEdit }) {
  return (
    <div className={ADMIN_TABLE_BOX}>
      <table className="w-full table-fixed text-left text-base max-[760px]:text-sm">
        <colgroup>
          <col className="w-[160px] max-[760px]:w-[76px]" />
          <col className="w-[96px] max-[760px]:w-[44px]" />
          <col />
          <col className="w-[176px] max-[760px]:w-[64px]" />
          <col className="w-[96px] max-[760px]:w-[60px]" />
        </colgroup>
        <thead>
          <tr className="border-b border-line text-sm text-subtle">
            {COLUMNS.map((column, index) => (
              <th
                key={column || index}
                scope="col"
                className="px-4 py-3 font-semibold whitespace-nowrap max-[760px]:px-1.5 max-[760px]:text-xs max-[760px]:leading-4 max-[760px]:whitespace-normal"
              >
                {column || <span className="sr-only">관리</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const { type, channel, template } = row;
            const isUsed = Boolean(template?.useYn);
            const isEditable =
              Boolean(template) || TEMPLATE_TYPE_CDS.includes(type.comCd);
            return (
              <tr
                key={`${type.comCd}-${channel.comCd}`}
                className="border-b border-line text-ink-2 last:border-b-0"
              >
                <td className={`${CELL} max-[760px]:break-keep`}>
                  {type.comCdNm}
                </td>
                <td className={`${CELL} whitespace-nowrap`}>
                  {channel.comCdNm}
                </td>
                <td
                  className={`${CELL} truncate ${template?.notiTtl ? '' : 'text-subtle'}`}
                  title={template?.notiTtl || undefined}
                >
                  {template?.notiTtl || '—'}
                </td>
                <td
                  className={`${CELL} max-[760px]:break-keep ${isUsed ? '' : 'text-subtle'}`}
                >
                  {getUseLabel(template)}
                </td>
                <td className={`${CELL} text-right`}>
                  {isEditable && (
                    <button
                      type="button"
                      aria-label={`${type.comCdNm} ${channel.comCdNm} 템플릿 ${template ? '수정' : '등록'}`}
                      className={ROW_BUTTON}
                      onClick={() => onEdit(row)}
                    >
                      {template ? '수정' : '등록'}
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
