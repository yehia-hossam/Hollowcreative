import { SPRITE_SHEET_URL, SPRITE_CROPS } from '../hollowmere/assets';
import type { SceneSpec } from '../hollowmere/data';
import { computeSpriteStyle } from '../hollowmere/math';

interface SceneOverlaysProps {
  scene: SceneSpec;
}

export function SceneOverlays({ scene }: SceneOverlaysProps) {
  const batUpCss = computeSpriteStyle(SPRITE_CROPS.batUp);

  return (
    <>
      {scene.moonglow && (
        <div
          className="moonglow"
          style={{
            left: `${scene.moonglow.x}%`,
            top: `${scene.moonglow.y}%`,
            width: `${scene.moonglow.w}%`,
          }}
          aria-hidden="true"
        />
      )}

      {scene.falls.map((fall, idx) => (
        <canvas
          key={`${scene.id}-fall-${idx}`}
          className="fall"
          data-kind={fall.kind}
          data-speed={String(fall.speed)}
          style={{
            left: `${fall.x}%`,
            top: `${fall.y}%`,
            width: `${fall.w}%`,
            height: `${fall.h}%`,
          }}
          aria-hidden="true"
        />
      ))}

      {scene.mist && (
        <div
          className="mist"
          style={{
            left: `${scene.mist.x}%`,
            top: `${scene.mist.y}%`,
            width: `${scene.mist.w}%`,
            height: `${scene.mist.h}%`,
          }}
          aria-hidden="true"
        />
      )}

      {scene.glows.map((glow, idx) => (
        <div
          key={`${scene.id}-glow-${idx}`}
          className={glow.cold ? 'glow cold' : 'glow'}
          style={{
            left: `${glow.x}%`,
            top: `${glow.y}%`,
            width: `${glow.w}%`,
            animationDelay: `${-((idx * 0.37) % 2.8).toFixed(2)}s`,
          }}
          aria-hidden="true"
        />
      ))}

      <canvas
        className="dust"
        data-dust={scene.dust.kind}
        data-count={String(scene.dust.count)}
        data-x={scene.dust.box ? String(scene.dust.box.x) : '0'}
        data-y={scene.dust.box ? String(scene.dust.box.y) : '0'}
        data-w={scene.dust.box ? String(scene.dust.box.w) : '100'}
        data-h={scene.dust.box ? String(scene.dust.box.h) : '100'}
        aria-hidden="true"
      />

      {scene.ghosts.map((ghost) => {
        const spriteCss = computeSpriteStyle(ghost.crop);
        return (
          <div
            key={ghost.id}
            className="ghost"
            data-ax={String(ghost.x)}
            data-ay={String(ghost.y)}
            data-phase={String(ghost.phase)}
            style={{
              width: `${ghost.w}%`,
              backgroundImage: `url('${SPRITE_SHEET_URL}')`,
              backgroundSize: spriteCss.backgroundSize,
              backgroundPosition: spriteCss.backgroundPosition,
              aspectRatio: spriteCss.aspectRatio,
            }}
            aria-hidden="true"
          />
        );
      })}

      {scene.bats.map((bat) => (
        <div
          key={bat.id}
          className="bat"
          data-y0={String(bat.y0)}
          data-dur={String(bat.durationSec)}
          data-off={String(bat.offset)}
          data-amp={String(bat.ampPct)}
          data-flap={String(bat.flapHz)}
          style={{
            width: `${bat.w}%`,
            backgroundImage: `url('${SPRITE_SHEET_URL}')`,
            backgroundSize: batUpCss.backgroundSize,
            backgroundPosition: batUpCss.backgroundPosition,
            aspectRatio: batUpCss.aspectRatio,
          }}
          aria-hidden="true"
        />
      ))}
    </>
  );
}
