"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { trapFocus } from "@/lib/trapFocus";

const NAV_LINKS: Array<{ label: string; href: string; mobileOnly?: boolean }> = [
  { label: "Our Work", href: "/our-work" },
  { label: "Privacy Policy", href: "/privacy-policy", mobileOnly: true },
  { label: "Accessibility", href: "/accessibility", mobileOnly: true },
];

export function SiteHeader() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const menuId = useId();

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflowY = "hidden";
    } else {
      document.body.style.overflowY = "auto";
    }
    if (menuOpen && navRef.current) {
      const release = trapFocus(
        'div, ul, li, a, [tabindex]:not([tabindex="-1"])',
        navRef.current,
      );
      return () => {
        release();
        document.body.style.overflowY = "auto";
      };
    }
  }, [menuOpen]);

  const toggle = () => setMenuOpen((v) => !v);

  return (
    <div
      data-is-root-path={isHomePage}
      className="px-3 lg:px-6 py-5 bg-white border-b border-b-ff_slateGray w-full z-40 fixed top-0"
    >
      <nav
        ref={navRef}
        id="hamburger-menu"
        className="relative lg:flex items-center justify-between mx-auto"
      >
        {isHomePage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/ff-logo.svg"
            alt="Fast Forward logo"
            className="w-16 xl:w-28"
          />
        ) : (
          <Link href="/" className="inline-block align-middle" tabIndex={1}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/ff-logo.svg"
              alt="Fast Forward logo"
              className="w-16 xl:w-28"
            />
          </Link>
        )}

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          aria-controls={menuId}
          onClick={toggle}
          className={`hamburger absolute top-3 right-0 lg:hidden ${menuOpen ? "is-active" : ""}`}
          tabIndex={2}
        >
          <span className="hamburger-bar" />
        </button>

        <ul
          id={menuId}
          aria-hidden={!menuOpen}
          className={`${menuOpen ? "menu-open" : "menu-closed"} mobile-nav flex lg:desktop-nav bg-white z-20`}
        >
          {NAV_LINKS.map(({ label, href, mobileOnly }) => (
            <li
              key={href}
              className={`mx-2 lg:mx-4 my-2 lg:my-0 inline-block text-xl xl:text-base ${
                mobileOnly ? "lg:hidden" : ""
              }`}
            >
              <Link
                href={href}
                className="text-ff_black hover-linear-gradient-underline"
                tabIndex={menuOpen ? 2 : undefined}
              >
                {label}
              </Link>
            </li>
          ))}
          <li className="ml-2 inline-block w-fit text-xl xl:text-base max-lg:hover-linear-gradient-underline lg:btn lg:ml-4 lg:align-middle lg:linear-gradient-background-hover">
            <Link
              href="/contact-us"
              className="text-ff_black lg:text-white"
              tabIndex={menuOpen ? 2 : 3}
            >
              Contact Us
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
