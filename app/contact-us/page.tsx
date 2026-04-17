import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Work with Fast Forward on your next project",
};

export default function ContactUsPage() {
  return (
    <div className="article section">
      <div className="mx-auto">
        <h1 className="inline-block text-lg md:text-base">Contact Us</h1>
        <address className="hidden md:block not-italic align-top md:float-right mb-6 md:ml-6 text-lg pt-4">
          <span className="font-medium">Fast Forward LLC</span>
          <br />
          2 Margin Street #747
          <br />
          Salem, MA 01970
          <a
            className="block hover:underline pt-2"
            href="mailto:hello@fastforward.sh"
          >
            hello@fastforward.sh
          </a>
          <a
            href="tel:16179030361"
            className="hover:underline block pt-2"
          >
            617.903.0361
          </a>
          <div className="mt-4">
            <a href="https://www.linkedin.com/company/fast-forward-innovation">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/Linkedin-black.svg"
                alt="Visit Fast Forward's LinkedIn page"
                className="hover:scale-110"
              />
            </a>
          </div>
        </address>
        <div className="lg:w-4/5">
          <div className="max-w-[86ch]">
            <h2 className="h1">Let&apos;s Work Together</h2>
            <p className="text-base sm:text-3xl pb-8">
              Have a fun project you&apos;d like to talk about? Want to join our
              team, or just say hi? Send us a quick message! We&apos;d love to
              hear from you.
            </p>
          </div>
          {/* TODO(phase-5): replace with <ContactForm /> — client component */}
          {/*   POSTs to /api/contact (new API route forwarding to Monday). */}
          <p className="text-ff_gray italic">
            Contact form coming soon. In the meantime, email{" "}
            <a
              className="text-ff_teal font-semibold hover:underline"
              href="mailto:hello@fastforward.sh"
            >
              hello@fastforward.sh
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
