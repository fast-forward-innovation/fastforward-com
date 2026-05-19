import Image from "next/image";
import type { FrontmatterImage, ImageBlock as ImageBlockData } from "@/lib/types";
import { PlaceholderImage } from "./PlaceholderImage";

function ImageOrPlaceholder({
  img,
  className,
  sizes,
  priority,
  fallbackWidth,
  fallbackHeight,
}: {
  img: FrontmatterImage;
  className: string;
  sizes?: string;
  priority?: boolean;
  fallbackWidth: number;
  fallbackHeight: number;
}) {
  if (img.placeholder) {
    return (
      <PlaceholderImage
        alt={img.alt}
        width={img.width ?? fallbackWidth}
        height={img.height ?? fallbackHeight}
        notes={img.notes}
        className={className}
      />
    );
  }
  return (
    <Image
      src={img.src}
      alt={img.alt}
      width={img.width ?? fallbackWidth}
      height={img.height ?? fallbackHeight}
      className={className}
      sizes={sizes}
      priority={priority}
    />
  );
}

export function ImageBlock({ block }: { block: ImageBlockData }) {
  const images = block.images.filter(Boolean);
  if (images.length === 0) return null;

  const narrow = block.width === "text";
  const one = images.length === 1;

  if (one) {
    const img = images[0];
    const image = (
      <ImageOrPlaceholder
        img={img}
        fallbackWidth={1600}
        fallbackHeight={900}
        className={
          narrow
            ? "w-full h-auto"
            : "max-lg:h-[50vh] w-full object-cover"
        }
        sizes={narrow ? "(min-width: 768px) 75vw, 100vw" : "100vw"}
      />
    );

    if (narrow) {
      return (
        <div className="px-6 md:px-12 my-8 md:my-[4.5rem]">
          <div className="mx-auto max-w-screen-xl">
            <div className="hidden md:inline-block md:w-1/4 align-top" aria-hidden />
            <div className="md:inline-block md:w-3/4 align-top">{image}</div>
          </div>
        </div>
      );
    }

    return <div className="my-8 md:my-[4.5rem]">{image}</div>;
  }

  const [a, b] = images;
  return (
    <div className="my-8 md:my-[4.5rem]">
      <div className="mx-auto lg:flex justify-between">
        <ImageOrPlaceholder
          img={a}
          fallbackWidth={1200}
          fallbackHeight={800}
          className="max-lg:mb-8 lg:inline-block w-full lg:mr-4 lg:w-1/2 object-cover"
          sizes="(min-width: 1024px) 50vw, 100vw"
        />
        <ImageOrPlaceholder
          img={b}
          fallbackWidth={1200}
          fallbackHeight={800}
          className="lg:inline-block w-full lg:ml-4 lg:w-1/2 object-cover"
          sizes="(min-width: 1024px) 50vw, 100vw"
        />
      </div>
    </div>
  );
}
