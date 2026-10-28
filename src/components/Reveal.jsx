import { useEffect, useRef, useState } from 'react';

const BASE =
  '[transition:transform_.35s_cubic-bezier(.2,.8,.2,1),opacity_.5s_ease,border-color_.25s_ease] motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none';

export default function Reveal({
  as = 'div',
  delay = 0,
  isInstant = false,
  popDelay,
  className = '',
  style,
  children,
  ...rest
}) {
  const Tag = as;
  const ref = useRef(null);
  const [isIn, setIsIn] = useState(isInstant);
  const [isSettled, setIsSettled] = useState(isInstant);

  useEffect(() => {
    const el = ref.current;
    if (isIn || !el) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setIsIn(true);
        observer.disconnect();
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isIn]);

  useEffect(() => {
    if (!isIn || isSettled) return undefined;
    const timer = setTimeout(() => setIsSettled(true), 1000);
    return () => clearTimeout(timer);
  }, [isIn, isSettled]);

  const pop =
    popDelay === undefined
      ? ''
      : 'animate-[man-pop_.45s_cubic-bezier(.2,.8,.2,1)_var(--d,0ms)_backwards] motion-reduce:animate-none';

  return (
    <Tag
      ref={ref}
      className={`${BASE} ${isIn ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'} ${pop} ${className}`}
      style={{
        ...style,
        transitionDelay: isSettled ? undefined : `${delay}ms`,
        ...(popDelay === undefined ? {} : { '--d': `${popDelay}ms` }),
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
