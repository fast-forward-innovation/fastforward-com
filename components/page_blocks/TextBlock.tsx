export function TextBlock({ fontSize = "text-xl md:text-3xl" }: { fontSize?: string }) {
  return (
    <div className="section xl:px-52 md:py-48 ff-entire-background">
      <div className="sm:text-center sm:mx-auto max-w-5xl">
        <div className={`${fontSize} leading-8 md:leading-[46px]`}>
          We strive to stay ahead of the curve, seeking out the latest tools,
          trends and techniques to bring your ideas to market. As experts in
          software development, design, and user experience, we know that
          success is rooted in a consistent and agile process. From
          sophisticated web integrations to interactive installations, we
          specialize in creating intuitive and impactful experiences. We take
          pride in being true partners, taking risks, and adapting to every
          project.
          <br />
          <div className="text-ff_teal font-semibold">
            We listen. We learn. We deliver.
          </div>
        </div>
      </div>
    </div>
  );
}
