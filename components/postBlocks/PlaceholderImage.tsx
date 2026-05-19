type Props = {
  alt: string;
  width?: number | null;
  height?: number | null;
  notes?: string;
  className?: string;
  fill?: boolean;
};

export function PlaceholderImage({
  alt,
  width,
  height,
  notes,
  className,
  fill,
}: Props) {
  const aspectRatio =
    !fill && width && height ? `${width} / ${height}` : undefined;

  const wrapperClass = [
    "relative flex items-center justify-center w-full bg-[var(--color-ff_lightGray)] border border-dashed border-[var(--color-ff_slateGray)] text-[var(--color-ff_gray)]",
    fill ? "h-full" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      role="img"
      aria-label={alt}
      className={wrapperClass}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      <div className="px-6 md:px-10 py-8 max-w-3xl text-center space-y-3">
        <div className="font-mono tracking-wider uppercase text-xs">
          Placeholder image
        </div>
        <p className="text-base md:text-lg leading-snug text-[var(--color-ff_black)]">
          {alt || "(no alt text)"}
        </p>
        {notes ? (
          <div className="pt-3 mt-3 border-t border-[var(--color-ff_slateGray)]/40 text-left">
            <div className="font-mono tracking-wider uppercase text-[10px] pb-1">
              Designer notes
            </div>
            <p className="text-sm leading-snug whitespace-pre-wrap">{notes}</p>
          </div>
        ) : null}
        {width && height ? (
          <div className="font-mono text-[10px] opacity-60 pt-2">
            {width} × {height}
          </div>
        ) : null}
      </div>
    </div>
  );
}
