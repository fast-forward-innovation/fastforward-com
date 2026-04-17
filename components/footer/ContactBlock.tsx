import Link from "next/link";

export function ContactBlock() {
  return (
    <section className="section-wide ff-background text-center lg:text-left">
      <div className="mx-auto lg:flex justify-between">
        <div>
          <h2 className="lg:w-80 relative">
            Let&apos;s Work Together
            <span className="absolute -bottom-10 -left-14 hidden lg:block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/red_arrow.svg" alt="" />
            </span>
          </h2>
        </div>

        <div className="lg:ml-8">
          <p className="text-lg sm:text-base mb-8">
            Ready to start a project? If you&apos;re excited, we&apos;re excited.{" "}
            <br className="hidden lg:block" />
            Drop us a line to start the conversation.
          </p>
          <Link
            href="/contact-us"
            className="btn inline-block font-semibold border-2 border-solid border-transparent hover:border-ff_lightGray py-4 px-20 transition bg-ff_lightGray hover:bg-transparent text-ff_black hover:text-ff_lightGray"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  );
}
