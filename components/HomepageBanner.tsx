"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import hero1 from "@/public/hero-images/homepage-rotation-1.jpeg";
import hero2 from "@/public/hero-images/homepage-rotation-2.jpeg";
import hero3 from "@/public/hero-images/homepage-rotation-3.jpg";

const WORDS = ["Design", "Develop", "Experience"];

export function HomepageBanner() {
  const bgRef = useRef<HTMLDivElement | null>(null);
  const [underlineStyle, setUnderlineStyle] = useState<{ left?: number; width?: string }>({});
  const [index, setIndex] = useState(WORDS.length - 1);

  useEffect(() => {
    function handleResize() {
      const el = document.querySelector<HTMLAnchorElement>("a.resizing-element");
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setUnderlineStyle({
        left: rect.x,
        width: `calc(${rect.width}px + (100vw - ${rect.right}px))`,
      });
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isReduced) return;

    const tick = () => {
      setIndex((prev) => (prev + 1) % WORDS.length);
    };
    const id = setInterval(tick, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      ref={bgRef}
      className="homepage-banner items-center relative h-[60vh] md:h-[80vh] flex flex-col bg-black"
    >
      {[hero1, hero2, hero3].map((src, i) => (
        <div
          key={i}
          className={`hero absolute inset-0 banner-background overflow-hidden ${
            i === index ? "entering brightness-[0.64]" : "brightness-50"
          }`}
        >
          <Image
            src={src}
            alt=""
            fill
            priority={i === index}
            quality={90}
            sizes="100vw"
            className="object-cover"
          />
        </div>
      ))}

      <h1 className="flex-auto w-full flex flex-col justify-center sm:items-center text-5xl sm:text-[6vw]">
        <span className="banner-words sm:flex gap-3 z-10 ml-4 sm:ml-0 block">
          {WORDS.map((word, i) => (
            <span
              key={word}
              className={`animated-underline w-fit leading-loose block word-parent ${
                i === index ? "entering" : "exiting"
              }`}
            >
              <span
                className={`hero-text z-10 transition-colors ease-in-out duration-500 motion-reduce:transition-none motion-reduce:text-white ${
                  i === index ? "text-white" : "text-white/[0.3]"
                }`}
              >
                {word}
                <span className="text-ff_red">. </span>
              </span>
            </span>
          ))}
        </span>
      </h1>

      <div className="hidden sm:flex-none sm:flex sm:justify-end">
        <Link
          href="/our-work"
          className="resizing-element absolute bottom-[4%] right-8 text-white hover:underline z-10 text-2xl lg:text-3xl"
        >
          More About What We Do →
        </Link>
        <div
          className="absolute linear-gradient-background h-[1.5%] bottom-0 right-8"
          style={{ left: underlineStyle.left, width: underlineStyle.width }}
        />
      </div>
    </div>
  );
}
