/**
 * [건강 일지 입력 모달 공통 스타일]
 * - 일정 추가·수정 모달(ScheduleModal)과 같은 입력칸·라벨 모양
 */

export const LABEL_CLASS =
  'flex items-center gap-0.5 text-base leading-[1.4] font-semibold text-[#1a3234]';

export const INPUT_CLASS =
  'block h-10 w-full rounded-[6px] border border-[#d3dae2] bg-white px-3 text-base leading-[1.4] text-[#1a3234] outline-none placeholder:text-[#8c9899] hover:border-[#b9c4c4] focus:border-[#285a5c] focus:shadow-[0_0_0_3px_rgba(40,90,92,0.18)] aria-invalid:border-[#b4473a] disabled:bg-[#f4f6f6] disabled:text-[#667374]';

export const SELECT_CLASS = `${INPUT_CLASS} appearance-none pt-px pr-9`;

export const TEXTAREA_CLASS = `${INPUT_CLASS} h-24 resize-none py-2.5`;

/** 시안 .sel의 오른쪽 화살표 */
export const SELECT_ARROW_STYLE = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24'%3E%3Cpath d='M7 10l5 5 5-5' fill='none' stroke='%23566465' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 10px center',
};

export const REQUIRED_MARK = '*';
