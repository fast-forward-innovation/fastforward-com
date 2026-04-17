import Link from "next/link";

export default function NotFound() {
  return (
    <main className="section main-section w-fit mx-auto">
      <span className="inline-block text-lg md:text-base">404 Error</span>
      <h1>Something&apos;s not right</h1>
      <div className="text-base">
        <p>
          We can&apos;t find the page you&apos;re looking for. Not to worry!
          Let&apos;s get you back on track.
        </p>
        <p>
          Our <Link href="/">homepage</Link> is a great place to start, or jump
          right into our latest <Link href="/our-work">work</Link>.
        </p>
        <p>
          You can always <Link href="/contact-us">contact us</Link> if you
          can&apos;t find what you&apos;re looking for.
        </p>
      </div>
    </main>
  );
}
