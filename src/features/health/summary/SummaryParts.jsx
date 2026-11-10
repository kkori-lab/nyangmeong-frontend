import Icon from '@/components/Icon';

/** 카드 제목: 영역 아이콘 + 이름 */
export function CardTitle({ icon, children }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Icon name={icon} className="text-brand-500" />
      {children}
    </span>
  );
}
