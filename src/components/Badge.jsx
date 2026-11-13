const TONES = {
  brand: 'bg-[#e9f2f2] text-[#1e4a4c]',
  gray: 'bg-[#eef1f4] text-[#59636e]',
  amber: 'bg-[#fcf1df] text-[#9a5c0c]',
  mine: 'bg-[#f9eaa6] text-[#1a3234]',
  white: 'bg-white text-[#1e4a4c]',
  ok: 'bg-[#e6f4ec] text-[#22744a] before:size-1.5 before:rounded-full before:bg-current before:content-[""]',
  outline: 'bg-white text-[#3d4a4b] shadow-[inset_0_0_0_1px_#e2e7e7]',
};

// 알약 모양 뱃지. 높이·여백·글자는 퍼블리싱 시안의 .badge와 같다(24px, 위 1.5px·옆 10px)
// bordered: 글자색 알파 0.1의 안쪽 1px 테두리(커뮤니티의 색 있는 배지). 크기는 그대로
export default function Badge({
  tone = 'gray',
  bordered = false,
  className = '',
  children,
}) {
  return (
    <span
      className={`inline-flex h-6 items-center gap-[5px] rounded-full px-2.5 pt-[1.5px] align-middle text-[13px] leading-none font-semibold whitespace-nowrap ${TONES[tone]} ${bordered ? 'ring-1 ring-current/10 ring-inset' : ''} ${className}`}
    >
      {children}
    </span>
  );
}
