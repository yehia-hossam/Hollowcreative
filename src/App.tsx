import { Fragment, useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { SceneOverlays } from './components/SceneOverlays';
import { SeamBand } from './components/SeamBand';
import {
  createStreakSprites,
  initDustCanvas,
  initFallCanvas,
  renderDustCanvas,
  renderFallCanvas,
  sizeDustCanvas,
  sizeFallCanvas,
  type DustCanvasState,
  type FallCanvasState,
} from './hollowmere/canvasEngine';
import { SCENES, SEAMS } from './hollowmere/data';
import { splitLinesInContainer } from './hollowmere/lineSplitter';
import {
  computeBatState,
  computeGhostState,
  computeHeroParallax,
  computeLanternStep,
  computeSmoothScrollStep,
} from './hollowmere/math';

const HERO_TITLE = 'HOLLOWMERE'.split('');

export default function App() {
  const navRef = useRef<HTMLElement>(null);
  const scrollerRef = useRef<HTMLElement>(null);
  const heroArtRef = useRef<HTMLDivElement>(null);
  const heroCopyRef = useRef<HTMLDivElement>(null);
  const heroH1Ref = useRef<HTMLHeadingElement>(null);
  const heroSubRef = useRef<HTMLParagraphElement>(null);
  const lampRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    const finePointer = window.matchMedia(
      '(hover: hover) and (pointer: fine)',
    ).matches;

    const ease = 'cubic-bezier(.2,.8,.2,1)';

    // Split paragraph copy into visual line spans after fonts load (and right away)
    const runSplit = () => {
      const allCopies = scroller.querySelectorAll<HTMLElement>('.copy');
      allCopies.forEach((copy) => splitLinesInContainer(copy));
    };
    runSplit();

    const syncBodyHeight = () => {
      document.body.style.height = `${scroller.offsetHeight}px`;
    };
    syncBodyHeight();

    // Initialize canvases
    const sprites = createStreakSprites();
    const fallStates: FallCanvasState[] = [];
    scroller.querySelectorAll<HTMLCanvasElement>('canvas.fall').forEach((c) => {
      const st = initFallCanvas(c);
      if (st) fallStates.push(st);
    });

    const dustStates: DustCanvasState[] = [];
    scroller.querySelectorAll<HTMLCanvasElement>('canvas.dust').forEach((c) => {
      const st = initDustCanvas(c);
      if (st) dustStates.push(st);
    });

    // Collect sprites
    interface GhostRuntime {
      el: HTMLElement;
      art: HTMLElement;
      ax: number;
      ay: number;
      phase: number;
      ox: number;
      oy: number;
    }
    const ghosts: GhostRuntime[] = [];
    scroller.querySelectorAll<HTMLElement>('.ghost').forEach((el) => {
      const art = el.closest<HTMLElement>('.art');
      if (!art) return;
      ghosts.push({
        el,
        art,
        ax: parseFloat(el.dataset.ax || '50'),
        ay: parseFloat(el.dataset.ay || '50'),
        phase: parseFloat(el.dataset.phase || '0'),
        ox: 0,
        oy: 0,
      });
    });

    interface BatRuntime {
      el: HTMLElement;
      y0: number;
      dur: number;
      off: number;
      amp: number;
      flap: number;
    }
    const bats: BatRuntime[] = [];
    scroller.querySelectorAll<HTMLElement>('.bat').forEach((el) => {
      bats.push({
        el,
        y0: parseFloat(el.dataset.y0 || '20'),
        dur: parseFloat(el.dataset.dur || '12'),
        off: parseFloat(el.dataset.off || '0'),
        amp: parseFloat(el.dataset.amp || '2'),
        flap: parseFloat(el.dataset.flap || '10'),
      });
    });

    // Copy reveal management
    const copyBlocks = Array.from(
      scroller.querySelectorAll<HTMLElement>('.copy'),
    );
    const revealedSet = new Set<HTMLElement>();

    const revealCopy = (copy: HTMLElement) => {
      if (revealedSet.has(copy)) return;
      revealedSet.add(copy);
      copy.classList.add('is-revealed');

      if (prefersReducedMotion) return;

      const spans = copy.querySelectorAll<HTMLElement>('.ln > span');
      spans.forEach((span, idx) => {
        span.animate(
          [
            { transform: 'translateY(105%)' },
            { transform: 'translateY(0)' },
          ],
          {
            duration: 1000,
            delay: idx * 80,
            easing: ease,
            fill: 'both',
          },
        );
      });

      const rule = copy.querySelector<HTMLElement>('.rule');
      if (rule) {
        rule.animate(
          [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }],
          {
            duration: 1100,
            delay: 160,
            easing: ease,
            fill: 'both',
          },
        );
      }
    };

    if (prefersReducedMotion) {
      copyBlocks.forEach((c) => {
        revealedSet.add(c);
        c.classList.add('is-revealed');
      });
    } else {
      // Load intro Web Animations
      const nav = navRef.current;
      if (nav) {
        nav.animate(
          [{ transform: 'translateY(-100%)' }, { transform: 'translateY(0)' }],
          { duration: 900, delay: 500, easing: ease, fill: 'both' },
        );
      }

      const heroArt = heroArtRef.current;
      if (heroArt) {
        heroArt.animate(
          [{ transform: 'scale(1.09)' }, { transform: 'scale(1)' }],
          {
            duration: 2600,
            easing: ease,
            composite: 'add',
          },
        );
      }

      const heroH1 = heroH1Ref.current;
      if (heroH1) {
        const chars = heroH1.querySelectorAll<HTMLElement>('.ch');
        chars.forEach((ch, idx) => {
          ch.animate(
            [
              { transform: 'translateY(110%)' },
              { transform: 'translateY(0)' },
            ],
            {
              duration: 1200,
              delay: 250 + idx * 70,
              easing: ease,
              fill: 'both',
            },
          );
        });
      }

      const heroSub = heroSubRef.current;
      if (heroSub) {
        heroSub.animate(
          [
            {
              letterSpacing: '1.4em',
              paddingLeft: '1.4em',
              transform: 'translateX(-50%) translateY(14px)',
              clipPath: 'inset(0 50% 0 50%)',
            },
            {
              letterSpacing: '.62em',
              paddingLeft: '.62em',
              transform: 'translateX(-50%) translateY(0)',
              clipPath: 'inset(0 0% 0 0%)',
            },
          ],
          {
            duration: 1600,
            delay: 900,
            easing: ease,
            fill: 'both',
          },
        );
      }
    }

    // Re-split lines & re-sync heights once fonts finish loading
    let disposed = false;
    document.fonts?.ready.then(() => {
      if (disposed) return;
      runSplit();
      syncBodyHeight();
    });

    // Cursor tracking for ghost repulsion & lantern glow
    let cursorX: number | null = null;
    let cursorY: number | null = null;
    let lampX = window.innerWidth * 0.5;
    let lampY = window.innerHeight * 0.5;
    let lampVisible = false;

    const onPointerMove = (e: PointerEvent) => {
      cursorX = e.clientX;
      cursorY = e.clientY;
      if (finePointer && lampRef.current && !lampVisible) {
        lampVisible = true;
        lampX = e.clientX;
        lampY = e.clientY;
        lampRef.current.style.opacity = '1';
      }
    };

    const onPointerLeave = () => {
      cursorX = null;
      cursorY = null;
      if (lampRef.current) {
        lampVisible = false;
        lampRef.current.style.opacity = '0';
      }
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('mouseleave', onPointerLeave);

    // Anchor clicks: native scroll jump, smooth scroll loop eases the glide
    const onAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement | null)?.closest<HTMLAnchorElement>(
        'a[href^="#"]',
      );
      if (!target) return;
      const hash = target.getAttribute('href');
      if (!hash || hash.length < 2) return;
      const section = document.getElementById(hash.slice(1));
      if (!section) return;
      e.preventDefault();
      window.scrollTo({ top: section.offsetTop, behavior: 'instant' as ScrollBehavior });
      try {
        history.pushState(null, '', hash);
      } catch {
        // Ignore history restrictions in sandboxed frames
      }
    };
    document.addEventListener('click', onAnchorClick);

    // Resize observer for scroller & canvases
    const handleResize = () => {
      syncBodyHeight();
      runSplit();
      fallStates.forEach(sizeFallCanvas);
      dustStates.forEach(sizeDustCanvas);
      if (prefersReducedMotion) {
        fallStates.forEach((st) => renderFallCanvas(st, sprites, 0, true));
        dustStates.forEach((st) => renderDustCanvas(st, 0, true));
      }
    };

    const ro = new ResizeObserver(handleResize);
    ro.observe(scroller);
    window.addEventListener('resize', handleResize);

    // Smooth scroll + animation loop
    let curScroll = window.scrollY;
    let lastTime = performance.now();
    let rafId = 0;

    const positionSpritesAtTime = (t: number, dt: number) => {
      const artRectCache = new Map<HTMLElement, DOMRect>();
      const getArtRect = (art: HTMLElement) => {
        let r = artRectCache.get(art);
        if (!r) {
          r = art.getBoundingClientRect();
          artRectCache.set(art, r);
        }
        return r;
      };

      for (let i = 0; i < ghosts.length; i++) {
        const g = ghosts[i];
        const rect = getArtRect(g.art);
        const out = computeGhostState({
          t,
          dt,
          phase: g.phase,
          anchorXPct: g.ax,
          anchorYPct: g.ay,
          artWidth: rect.width,
          artHeight: rect.height,
          artLeft: rect.left,
          artTop: rect.top,
          cursorX: prefersReducedMotion ? null : cursorX,
          cursorY: prefersReducedMotion ? null : cursorY,
          offsetX: g.ox,
          offsetY: g.oy,
        });
        g.ox = out.offsetX;
        g.oy = out.offsetY;
        g.el.style.transform = `translate3d(${out.x.toFixed(2)}px, ${out.y.toFixed(2)}px, 0) translate(-50%, -50%) rotate(${out.rotateDeg.toFixed(2)}deg)`;
      }

      for (let i = 0; i < bats.length; i++) {
        const b = bats[i];
        const out = computeBatState({
          t,
          durationSec: b.dur,
          offset: b.off,
          y0Pct: b.y0,
          ampPct: b.amp,
          flapHz: b.flap,
        });
        b.el.style.left = `${out.xPct.toFixed(3)}%`;
        b.el.style.top = `${out.yPct.toFixed(3)}%`;
        b.el.style.transform = 'translate(-50%, -50%)';
        b.el.classList.toggle('down', out.wingsDown);
      }
    };

    const applyScrollTransforms = (scrollPx: number) => {
      scroller.style.transform = `translate3d(0, ${(-scrollPx).toFixed(2)}px, 0)`;

      const heroScene = heroArtRef.current?.parentElement;
      const heroH = heroScene ? heroScene.offsetHeight : window.innerHeight;
      const parallax = computeHeroParallax(scrollPx, heroH);

      if (heroArtRef.current) {
        heroArtRef.current.style.transform = `translate3d(0, ${parallax.artY.toFixed(2)}px, 0)`;
      }
      if (heroCopyRef.current) {
        heroCopyRef.current.style.transform = `translate3d(0, ${parallax.copyY.toFixed(2)}px, 0)`;
      }
      if (heroH1Ref.current) {
        heroH1Ref.current.style.setProperty(
          '--lsx',
          `${parallax.letterSpacingExtraEm.toFixed(4)}em`,
        );
      }
    };

    // Draw initial still frame at t = 0
    applyScrollTransforms(curScroll);
    positionSpritesAtTime(0, 0);
    fallStates.forEach((st) => renderFallCanvas(st, sprites, 0, true));
    dustStates.forEach((st) => renderDustCanvas(st, 0, true));

    const checkReveals = () => {
      if (prefersReducedMotion) return;
      const triggerY = window.innerHeight * 0.8;
      for (let i = 0; i < copyBlocks.length; i++) {
        const c = copyBlocks[i];
        if (revealedSet.has(c)) continue;
        const rect = c.getBoundingClientRect();
        if (rect.top <= triggerY) {
          revealCopy(c);
        }
      }
    };

    const onReducedScroll = () => {
      curScroll = window.scrollY;
      applyScrollTransforms(curScroll);
    };

    if (prefersReducedMotion) {
      window.addEventListener('scroll', onReducedScroll, { passive: true });
    } else {
      const startTime = performance.now();
      const tick = (now: number) => {
        const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
        lastTime = now;
        const t = (now - startTime) / 1000;

        curScroll = computeSmoothScrollStep(curScroll, window.scrollY, dt);
        applyScrollTransforms(curScroll);
        checkReveals();

        if (finePointer && lampRef.current && cursorX !== null && cursorY !== null) {
          const nextLamp = computeLanternStep(lampX, lampY, cursorX, cursorY, dt);
          lampX = nextLamp.x;
          lampY = nextLamp.y;
          lampRef.current.style.transform = `translate3d(${(lampX - 260).toFixed(1)}px, ${(lampY - 260).toFixed(1)}px, 0)`;
        }

        positionSpritesAtTime(t, dt);

        for (let i = 0; i < fallStates.length; i++) {
          renderFallCanvas(fallStates[i], sprites, t);
        }
        for (let i = 0; i < dustStates.length; i++) {
          renderDustCanvas(dustStates[i], t);
        }

        rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', onReducedScroll);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('mouseleave', onPointerLeave);
      document.removeEventListener('click', onAnchorClick);
    };
  }, []);

  return (
    <>
      <header ref={navRef} className="nav">
        <nav className="nav-left" aria-label="Festival sections">
          <a href="#story" className="nav-link">
            Our Story
          </a>
          <a href="#rites" className="nav-link">
            The Rites
          </a>
          <a href="#night" className="nav-link">
            Visitors
          </a>
        </nav>

        <a href="#top" className="nav-logo" aria-label="Hollowmere home">
          <svg
            width="26"
            height="24"
            viewBox="0 0 26 24"
            fill="none"
            aria-hidden="true"
          >
            <polygon points="13,1 25,23 1,23" fill="#F4F0FF" />
            <circle cx="13" cy="15.2" r="3.4" fill="#110A2A" />
            <circle cx="14.4" cy="14.4" r="3" fill="#F4F0FF" />
          </svg>
        </a>

        <div className="nav-right">
          <a href="#finale" className="nav-link nav-hide-mobile">
            Gallery
          </a>
          <a href="#finale" className="nav-link nav-hide-mobile">
            Journal
          </a>
          <a href="#finale" className="nav-tickets">
            Tickets
          </a>
        </div>
      </header>

      <main ref={scrollerRef} id="scroller">
        {SCENES.map((scene, idx) => {
          const seam = SEAMS[idx];
          const isHero = scene.id === 'top';
          const copy = scene.copy;

          return (
            <Fragment key={scene.id}>
              <section
                id={scene.id}
                className={isHero ? 'scene scene-hero' : 'scene'}
                data-testid={`scene-${scene.id}`}
              >
                <div
                  ref={isHero ? heroArtRef : undefined}
                  className="art"
                  style={
                    {
                      '--focus': scene.focus,
                    } as CSSProperties
                  }
                >
                  <div
                    className="bg"
                    style={
                      {
                        '--img': `url('${scene.image}')`,
                      } as CSSProperties
                    }
                  />
                  <SceneOverlays scene={scene} />
                </div>

                {isHero && (
                  <div ref={heroCopyRef} className="hero-copy">
                    <h1 ref={heroH1Ref}>
                      {HERO_TITLE.map((ch, charIdx) => (
                        <span key={charIdx} className="ch">
                          {ch}
                        </span>
                      ))}
                    </h1>
                    <p ref={heroSubRef} className="sub">
                      A NIGHT OF LANTERNS
                    </p>
                  </div>
                )}

                {copy && (
                  <div
                    className={
                      copy.align === 'center' ? 'copy finale' : 'copy'
                    }
                    style={
                      copy.align === 'center'
                        ? { top: `${copy.topPct}%`, width: `${copy.widthPct}%` }
                        : {
                            left: `${copy.leftPct}%`,
                            top: `${copy.topPct}%`,
                            width: `${copy.widthPct}%`,
                          }
                    }
                  >
                    <h2>
                      <span className="ln">
                        <span>{copy.h2}</span>
                      </span>
                    </h2>
                    <div className="rule" aria-hidden="true" />
                    {copy.items.map((item, itemIdx) =>
                      item.type === 'h3' ? (
                        <h3 key={itemIdx}>
                          <span className="ln">
                            <span>{item.text}</span>
                          </span>
                        </h3>
                      ) : (
                        <p key={itemIdx} data-split-lines="1">
                          {item.text}
                        </p>
                      ),
                    )}
                    {copy.buttons && copy.buttons.length > 0 && (
                      <div className="ln ln-btn">
                        <span>
                          <div className="btns">
                            {copy.buttons.map((b) => (
                              <a
                                key={b.label}
                                href={b.href}
                                className={b.ghost ? 'btn ghost' : 'btn'}
                              >
                                {b.label}
                              </a>
                            ))}
                          </div>
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </section>

              {seam && <SeamBand seam={seam} />}
            </Fragment>
          );
        })}
      </main>

      <div ref={lampRef} className="lamp" aria-hidden="true" />
    </>
  );
}
