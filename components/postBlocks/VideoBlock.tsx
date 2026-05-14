import type { VideoBlock as VideoBlockData } from "@/lib/types";

function embedUrl(block: VideoBlockData): string | null {
  const provider = block.provider ?? inferProvider(block.src);
  if (provider === "loom") {
    const id = extractLoomId(block.src);
    return id ? `https://www.loom.com/embed/${id}` : block.src;
  }
  if (provider === "youtube") {
    const id = extractYoutubeId(block.src);
    return id ? `https://www.youtube.com/embed/${id}` : block.src;
  }
  return null;
}

function inferProvider(src: string): "loom" | "youtube" | "file" {
  if (/loom\.com/i.test(src)) return "loom";
  if (/youtube\.com|youtu\.be/i.test(src)) return "youtube";
  return "file";
}

function extractLoomId(src: string): string | null {
  const m = src.match(/loom\.com\/(?:share|embed)\/([a-zA-Z0-9]+)/);
  return m?.[1] ?? null;
}

function extractYoutubeId(src: string): string | null {
  const m =
    src.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m?.[1] ?? null;
}

export function VideoBlock({ block }: { block: VideoBlockData }) {
  const provider = block.provider ?? inferProvider(block.src);
  const aspect = block.aspectRatio ?? "16 / 9";
  const embed = embedUrl(block);

  return (
    <div className="section main-section video-section">
      <div className="mx-auto">
        <div className="md:inline-block md:w-1/4 align-top" aria-hidden />
        <div className="md:inline-block md:w-3/4 align-top">
          <figure className="video-card">
            <div
              className="video-card__frame"
              style={{ aspectRatio: aspect }}
            >
              {provider === "file" ? (
                <video
                  src={block.src}
                  poster={block.poster}
                  controls
                  playsInline
                  preload="metadata"
                  className="video-card__media"
                />
              ) : (
                <iframe
                  src={embed ?? block.src}
                  title={block.title ?? "Screencast"}
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                  className="video-card__media"
                />
              )}
            </div>
            {block.caption ? (
              <figcaption className="video-card__caption">
                {block.caption}
              </figcaption>
            ) : null}
          </figure>
        </div>
      </div>
    </div>
  );
}
