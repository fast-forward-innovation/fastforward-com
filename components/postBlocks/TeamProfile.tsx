import Image from "next/image";
import type { TeamProfile as TeamProfileData } from "@/lib/types";
import { DefaultAvatar } from "./DefaultAvatar";

export function TeamProfile({ block }: { block: TeamProfileData }) {
  const kind = block.kind ?? "individual";
  const eyebrow = kind === "team" ? "Team" : "Built by";

  return (
    <div className="section main-section team-profile">
      <div className="mx-auto">
        <h2 className="md:inline-block md:w-1/4 align-top text-md pb-6 md:pb-0">
          <span className="block font-mono text-xs md:text-md tracking-wider pb-2 md:pt-2 md:pb-8 uppercase">
            {eyebrow}
          </span>
        </h2>
        <div className="md:inline-block md:w-3/4 align-top">
          <div className="team-profile__card">
            <div className="team-profile__avatar" aria-hidden={!block.avatar}>
              {block.avatar ? (
                <Image
                  src={block.avatar.src}
                  alt={block.avatar.alt || block.name}
                  width={block.avatar.width ?? 200}
                  height={block.avatar.height ?? 200}
                  className="team-profile__avatar-img"
                />
              ) : (
                <DefaultAvatar
                  className="team-profile__avatar-svg"
                  ariaLabel={`${block.name} avatar`}
                />
              )}
            </div>
            <div className="team-profile__body">
              <p className="team-profile__name">{block.name}</p>
              {block.role ? (
                <p className="team-profile__role">{block.role}</p>
              ) : null}
              {block.bio ? (
                <p
                  className="team-profile__bio"
                  dangerouslySetInnerHTML={{ __html: block.bio }}
                />
              ) : null}
              {block.links && block.links.length > 0 ? (
                <ul className="team-profile__links">
                  {block.links.map((l) => (
                    <li key={l.url}>
                      <a href={l.url} target="_blank" rel="noreferrer">
                        {l.label} ↗
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
