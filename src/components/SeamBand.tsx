import type { CSSProperties } from 'react';
import type { SeamSpec } from '../hollowmere/data';

interface SeamBandProps {
  seam: SeamSpec;
}

export function SeamBand({ seam }: SeamBandProps) {
  return (
    <div className="seam" aria-hidden="true">
      <div
        className="band"
        style={{ '--focus': seam.focus } as CSSProperties}
      >
        {seam.fall && (
          <canvas
            className="fall seam-fall"
            data-kind="ghost"
            data-seam="1"
            data-speed={String(seam.fall.speed)}
            style={{
              left: `${seam.fall.x}%`,
              top: `${seam.fall.y}%`,
              width: `${seam.fall.w}%`,
              height: `${seam.fall.h}%`,
              zIndex: 0,
            }}
          />
        )}
        <img
          src={seam.image}
          alt=""
          className="band-img"
          referrerPolicy="no-referrer"
          decoding="async"
        />
      </div>
    </div>
  );
}
