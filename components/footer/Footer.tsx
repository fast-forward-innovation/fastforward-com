import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative">
      <div className="section-wide text-center lg:text-left text-ff_lightGray">
        <div className="lg:grid grid-cols-3 mx-auto">
          <div className="justify-self-start mx-auto lg:m-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/FF-footer-logo.svg"
              alt="Fast Forward logo"
              className="mx-auto"
              width={150}
            />
            <div className="text-[1.25rem] md:text-[1.5rem] mt-6">
              <span className="lg:block tracking-wider">
                Design<span className="text-ff_red">. </span>
              </span>
              <span className="lg:block tracking-wider">
                Develop<span className="text-ff_red">. </span>
              </span>
              <span className="lg:block tracking-wider">
                Experience<span className="text-ff_red">. </span>
              </span>
            </div>
          </div>

          <div className="w-full lg:w-fit lg:justify-self-end order-2">
            <address className="not-italic my-12 lg:my-0 md:text-lg">
              <span className="font-mono text-xs md:text-sm uppercase block mb-4">
                Contact Us
              </span>
              <span className="font-medium">Fast Forward LLC</span>
              <br />
              2 Margin Street #747
              <br />
              Salem, MA 01970
              <a
                className="pt-2 block w-fit mx-auto lg:mx-0"
                href="mailto:hello@fastforward.sh"
              >
                hello@fastforward.sh
              </a>
              <a
                className="pt-2 block w-fit mx-auto lg:mx-0"
                href="tel:16179030361"
              >
                617.903.0361
              </a>
              <div className="mt-4">
                <a href="https://www.linkedin.com/company/fast-forward-innovation">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/Linkedin.svg"
                    alt="Visit Fast Forward LinkedIn page"
                    className="mx-auto lg:mx-0 lg:mb-2 hover:scale-110"
                  />
                </a>
              </div>
            </address>
          </div>
          <hr className="opacity-20 mx-auto lg:hidden" />
          <div className="w-fit lg:w-full flex flex-col items-center justify-between order-1 mx-auto">
            <ul
              id="footer-links"
              className="grid grid-cols-2 gap-y-8 gap-x-12 mt-10 lg:m-0 text-left text-md md:text-lg mb-16"
            >
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/privacy-policy">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/our-work">Our Work</Link>
              </li>
              <li>
                <Link href="/accessibility">Accessibility</Link>
              </li>
            </ul>
            <p className="text-xs leading-loose w-fit">
              © Copyright {new Date().getFullYear()} &mdash; Fast Forward LLC{" "}
              <br className="sm:hidden" />
            </p>
          </div>
        </div>
      </div>
      <div className="hidden lg:block h-2.5 w-full bg-ff_red absolute bottom-0 left-0" />
    </footer>
  );
}
