import { useRef } from 'react';
import useInView from '@/hooks/useInView';

export default function FadeIn({
  as = 'div',
  delay = 0,
  className = '',
  children,
}) {
  const Tag = as;
  const ref = useRef(null);
  const isIn = useInView(ref, {
    threshold: 0,
    rootMargin: '0px 0px -15% 0px',
    isOnce: true,
  });

  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-[opacity,transform] duration-[1400ms] ease-[cubic-bezier(0.33,1,0.68,1)] motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none ${
        isIn
          ? 'translate-y-0 opacity-100'
          : 'translate-y-15 opacity-0 max-lg:translate-y-8'
      } ${className}`}
    >
      {children}
    </Tag>
  );
}
