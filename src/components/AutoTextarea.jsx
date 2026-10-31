import { useEffect, useRef } from 'react';
import { fitHeight } from '@/utils/fitHeight';

/**
 * 글 길이에 높이를 맞추는 입력칸(늘고 줄어듦)
 * - 최소·최대 높이는 className(min-h·max-h)으로 지정
 * - 창 너비가 바뀌면 줄바꿈 위치가 달라지므로 높이 재조정
 */
export default function AutoTextarea({ value, className = '', ...rest }) {
  const ref = useRef(null);

  useEffect(() => {
    fitHeight(ref.current);
  }, [value]);

  useEffect(() => {
    const refit = () => fitHeight(ref.current);
    window.addEventListener('resize', refit);
    return () => window.removeEventListener('resize', refit);
  }, []);

  return <textarea ref={ref} value={value} className={className} {...rest} />;
}
