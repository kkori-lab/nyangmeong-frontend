import { useEffect, useState } from 'react';

export default function useInView(
  ref,
  { threshold = 0.1, rootMargin = '0px', isOnce = false } = {},
) {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
        if (entry.isIntersecting && isOnce) observer.disconnect();
      },
      { threshold, rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, threshold, rootMargin, isOnce]);

  return isInView;
}
