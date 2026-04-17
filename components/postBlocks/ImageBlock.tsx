import Image from "next/image";
import type { ImageBlock as ImageBlockData } from "@/lib/types";

export function ImageBlock({ block }: { block: ImageBlockData }) {
  const images = block.images.filter(Boolean);
  if (images.length === 0) return null;

  const one = images.length === 1;

  if (one) {
    const img = images[0];
    return (
      <div className="my-8 md:my-[4.5rem]">
        <Image
          src={img.src}
          alt={img.alt}
          width={img.width ?? 1600}
          height={img.height ?? 900}
          className="max-lg:h-[50vh] w-full object-cover"
          sizes="100vw"
        />
      </div>
    );
  }

  const [a, b] = images;
  return (
    <div className="my-8 md:my-[4.5rem]">
      <div className="mx-auto lg:flex justify-between">
        <Image
          src={a.src}
          alt={a.alt}
          width={a.width ?? 1200}
          height={a.height ?? 800}
          className="max-lg:mb-8 lg:inline-block w-full lg:mr-4 lg:w-1/2 object-cover"
          sizes="(min-width: 1024px) 50vw, 100vw"
        />
        <Image
          src={b.src}
          alt={b.alt}
          width={b.width ?? 1200}
          height={b.height ?? 800}
          className="lg:inline-block w-full lg:ml-4 lg:w-1/2 object-cover"
          sizes="(min-width: 1024px) 50vw, 100vw"
        />
      </div>
    </div>
  );
}
