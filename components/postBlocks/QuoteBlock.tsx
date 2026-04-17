import type { ClientQuote } from "@/lib/types";

export function QuoteBlock({ section }: { section: ClientQuote }) {
  return (
    <div className="section md:w-3/4 lg:w-2/3 mx-auto quote-section">
      <h2 className="text-xs md:text-md font-mono tracking-wider uppercase">
        <span className="md:block" /> {section.tagline}
      </h2>
      <blockquote
        className="text-2xl md:text-3xl md:leading-9 lg:text-5xl leading-normal md:leading-normal lg:leading-normal"
        dangerouslySetInnerHTML={{ __html: section.quote ?? "" }}
      />
      <figcaption className="text-md md:text-lg mt-6">
        {section.clientName}
      </figcaption>
    </div>
  );
}
