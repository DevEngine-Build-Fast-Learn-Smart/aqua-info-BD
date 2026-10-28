import { useEffect, useState } from 'react';
import { WebsiteLogo } from './WebsiteLogo';
export function SplashScreen() {
  const [visible, setVisible] = useState(() => {
    try {
      return !sessionStorage.getItem('aqua:welcomed');
    } catch {
      return true;
    }
  });
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    if (!visible) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const leave = setTimeout(() => setLeaving(true), reduced ? 80 : 1050);
    const done = setTimeout(
      () => {
        setVisible(false);
        try {
          sessionStorage.setItem('aqua:welcomed', '1');
        } catch {
          /* Splash remains optional. */
        }
      },
      reduced ? 100 : 1500,
    );
    return () => {
      clearTimeout(leave);
      clearTimeout(done);
    };
  }, [visible]);
  if (!visible) return null;
  return (
    <div
      className={`splash ${leaving ? 'splash-leaving' : ''}`}
      role="status"
      aria-label="Welcome to Aqua Info BD"
    >
      <div className="splash-orbit">
        <span />
        <WebsiteLogo alt="Aqua Info BD — Beyond the Water" />
      </div>
      <p>STORIES FROM THE WATER. PERSPECTIVES BEYOND IT.</p>
      <div className="splash-progress">
        <span />
      </div>
    </div>
  );
}
