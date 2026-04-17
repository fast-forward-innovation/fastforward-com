import { getAllProjects, getSettings } from "@/lib/content";

export default function Home() {
  const settings = getSettings();
  const projects = getAllProjects();

  return (
    <div className="section-wide">
      <div className="mx-auto">
        <h1>{settings.siteTitle}</h1>
        <p className="text-lg mb-12">{settings.siteDescription}</p>

        <h2 className="mt-12">Our Work ({projects.length})</h2>
        <ul className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <li key={p.slug} className="border border-ff_slateGray p-6">
              <h3 className="text-ff_black">{p.title}</h3>
              {p.additionalPostFields?.label && (
                <p className="font-mono text-xs uppercase text-ff_gray mb-2">
                  {p.additionalPostFields.label}
                </p>
              )}
              {p.services.length > 0 && (
                <p className="text-sm text-ff_teal">
                  {p.services.join(" • ")}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
