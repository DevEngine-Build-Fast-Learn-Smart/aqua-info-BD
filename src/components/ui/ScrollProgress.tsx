import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      ref.current?.style.setProperty(
        '--scroll-progress',
        String(height > 0 ? Math.min(1, Math.max(0, window.scrollY / height)) : 0),
      );
    };
    const scroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', scroll, { passive: true });
    window.addEventListener('resize', scroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', scroll);
      window.removeEventListener('resize', scroll);
    };
  }, [pathname]);
  return (
    <div className="scroll-progress" ref={ref} aria-hidden="true">
      <span />
    </div>
  );
}
