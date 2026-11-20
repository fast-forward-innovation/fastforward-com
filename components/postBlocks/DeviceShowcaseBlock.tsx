"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { DeviceShowcase } from "@/lib/types";

/**
 * A tablet mockup on a solid color panel whose screen content is tied to
 * the page scroll. As the reader scrolls, the device pins just below the
 * site header, the screenshot inside it scrolls to the end, and then the
 * page carries on. The whole thing reads as one continuous scroll.
 *
 * How it works: the device sits in a `position: sticky` wrapper, and the
 * panel grows by exactly the distance the screenshot has to travel
 * (`--scroll-distance`, held by a spacer after the sticky wrapper). A scroll listener maps the page position inside
 * that extra distance to a translate on the screenshot.
 *
 * Without JavaScript the `is-linked` class never lands, so the screen stays
 * an ordinary focusable scroll region and the content is still reachable.
 */
export function DeviceShowcaseBlock({ block }: { block: DeviceShowcase }) {
  const { screen } = block;
  const stageRef = useRef<HTMLElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const viewport = screenRef.current;
    const content = contentRef.current;
    if (!stage || !viewport || !content) return;

    let distance = 0;
    let frame = 0;

    const update = () => {
      frame = 0;
      const styles = getComputedStyle(stage);
      const pinTop = parseFloat(styles.getPropertyValue("--pin-top")) || 0;
      const padTop = parseFloat(styles.paddingTop) || 0;
      // The sticky wrapper starts pinning once the panel's top padding has
      // scrolled up to the pin line; progress runs over `distance` px.
      const travelled = pinTop - (stage.getBoundingClientRect().top + padTop);
      const progress = distance > 0 ? Math.min(1, Math.max(0, travelled / distance)) : 0;
      content.style.transform = `translate3d(0, ${-progress * distance}px, 0)`;
    };

    const measure = () => {
      distance = Math.max(0, content.offsetHeight - viewport.clientHeight);
      stage.style.setProperty("--scroll-distance", `${distance}px`);
      update();
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    // Hand scrolling over to the page: the screen no longer scrolls on its
    // own, so it shouldn't be a separate tab stop.
    stage.classList.add("is-linked");
    viewport.removeAttribute("tabindex");
    viewport.removeAttribute("role");

    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(content);
    window.addEventListener("scroll", onScroll, { passive: true });
    measure();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
      stage.classList.remove("is-linked");
      content.style.transform = "";
    };
  }, []);

  return (
    <figure
      ref={stageRef}
      className="device-showcase"
      style={block.background ? { backgroundColor: block.background } : undefined}
    >
      <div className="device-showcase__sticky">
        <div className="device-showcase__tablet">
          <div
            ref={screenRef}
            className="device-showcase__screen"
            tabIndex={0}
            role="region"
            aria-label={`Scrollable screenshot: ${screen.alt}`}
          >
            <div ref={contentRef} className="device-showcase__content">
              <Image
                src={screen.src}
                alt={screen.alt}
                width={screen.width ?? 1316}
                height={screen.height ?? 2400}
                quality={90}
                sizes="(min-width: 1280px) 960px, 80vw"
                className="device-showcase__image"
              />
            </div>
          </div>
        </div>
        {block.caption ? (
          <figcaption className="device-showcase__caption">{block.caption}</figcaption>
        ) : (
          <figcaption className="device-showcase__caption">
            <span className="device-showcase__hint--static">
              Scroll inside the screen to explore the page.
            </span>
            <span className="device-showcase__hint--linked">
              Keep scrolling to explore the page.
            </span>
          </figcaption>
        )}
      </div>
      <div className="device-showcase__spacer" aria-hidden="true" />
    </figure>
  );
}
