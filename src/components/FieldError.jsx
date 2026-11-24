import Icon from './Icon';

/** 입력칸 아래 오류 안내 한 줄(아이콘 + 문구). children이 없으면 그리지 않는다 */
/** className: 바깥 여백·칸(기본 위 6px). FieldFoot처럼 한 줄에 둘 때 바꾼다 */
export default function FieldError({ id, className = 'mt-1.5', children }) {
  if (!children) return null;

  return (
    <p
      id={id}
      role="alert"
      className={`flex items-center gap-1 text-sm text-danger ${className}`}
    >
      <Icon name="error" className="text-base" />
      {children}
    </p>
  );
}

/** 라벨 옆 필수 표시(*). 화면 읽기에는 "필수"로 읽힌다 */
export function Required() {
  return (
    <span className="ml-0.5 font-semibold text-danger">
      <span aria-hidden="true">*</span>
      <span className="sr-only">필수</span>
    </span>
  );
}
