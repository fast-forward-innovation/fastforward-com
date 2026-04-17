export function ServiceBlock() {
  return (
    <div className="section bg-gradient-to-b from-white to-[#F3F7FB]">
      <div className="mx-auto lg:flex justify-between">
        <div className="lg:inline-block lg:w-[35ch] xl:w-[50ch]">
          <h2 className="lg:max-w-[9ch]">Our Services</h2>
          <p className="text-md leading-7 sm:text-base">
            Our team can support any part of the development lifecycle. Our
            deep understanding of software engineering allows us to build and
            connect complicated software systems, faster. The team&apos;s
            in-depth knowledge of user experience best practices allows us to
            design interfaces that enable success efficiently. We know what to
            automate and we know when to take a hands on approach. Whether you
            need help reimagining your website, optimizing your mobile app, or
            improving your trade show presentation, our team is eager to help.
          </p>
        </div>

        <div className="sm:inline-grid mx-0 lg:ml-6 w-fit grid-cols-2 align-top gap-10 mt-10 lg:mt-0 text-[#1b1a1c]">
          <ServiceCategory
            icon="/icon-strategy.svg"
            name="Strategy"
            items={[
              "Digital Strategy and Consulting",
              "Technical Consulting",
              "Competitive Analysis",
              "Platform Evaluation",
              "User Experience Audits",
              "Project Management",
            ]}
          />
          <ServiceCategory
            icon="/icon-design.svg"
            name="Design"
            items={[
              "UX / UI Design",
              "Experiential Design",
              "Design Prototyping",
              "2D / 3D Animation",
              "Design Systems",
              "Visual Identity",
            ]}
          />
          <ServiceCategory
            icon="/icon-development.svg"
            name="Development"
            items={[
              "Software Development",
              "Mobile, Desktop, Web",
              "Content Management Systems",
              "API Development",
              "Cloud Platform Integration",
              "Hardware Integrations",
              "AR / VR Development",
            ]}
          />
          <ServiceCategory
            icon="/icon-support.svg"
            name="Support"
            items={[
              "Hosting and Maintenance",
              "Platform Migration",
              "Managed Updates",
              "Automated Testing",
              "Accessibility Compliance",
              "Translation Services",
              "Analytics",
            ]}
          />
        </div>
      </div>
    </div>
  );
}

function ServiceCategory({
  icon,
  name,
  items,
}: {
  icon: string;
  name: string;
  items: string[];
}) {
  return (
    <div className="pb-16">
      <div className="flex pb-9">
        <div className="pr-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={icon} alt="" width={64} height={64} />
        </div>
        <h3 className="my-auto p-0">{name}</h3>
      </div>
      <ul className="list-disc text-sm md:text-md pl-7 space-y-2">
        {items.map((it) => (
          <li key={it}>{it}</li>
        ))}
      </ul>
    </div>
  );
}
