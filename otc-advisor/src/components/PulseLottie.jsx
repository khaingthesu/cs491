// Thin default-export wrapper around the Lottie player so it can be
// lazy-loaded with React.lazy. Keeping the heavy lottie-web player behind a
// dynamic import means it only loads when the Home page actually renders and
// never blocks dev-server startup or the other routes.
import { Lottie } from 'lottie-react';
import pulseAnimation from '../assets/pulse.json';

export default function PulseLottie() {
  return (
    <Lottie
      src={pulseAnimation}
      loop
      autoplay
      style={{ width: 180, height: 180, margin: '0 auto' }}
    />
  );
}
