import type { CalloutName } from "@/lib/callouts";
import { HaitiLatency } from "./HaitiLatency";
import { NumberedCallout } from "./NumberedCallout";

function FiveFears() {
  return (
    <NumberedCallout
      title="Five fears about leaving WordPress."
      accent="red"
      items={[
        "“We’ll lose our SEO.”",
        "“Our editors will lose control.”",
        "“We’ll have to rebuild every plugin.”",
        "“The new platform is unproven.”",
        "“We’ll be locked to our agency.”",
      ]}
    />
  );
}

function FiveAdvantages() {
  return (
    <NumberedCallout
      title="Five advantages of Next.js and Pantheon P1."
      accent="teal"
      items={[
        "Visual editing, with structure kept in code",
        "Content and code reviewed separately",
        "One front door instead of a template per type",
        "Fast, cached pages served from the edge",
        "Every old URL kept, with no redirects",
      ]}
    />
  );
}

/** Marker name (`<div data-callout="…">`) → component. */
export const CALLOUTS: Record<CalloutName, () => React.JSX.Element> = {
  "five-fears": FiveFears,
  "five-advantages": FiveAdvantages,
  "haiti-latency": HaitiLatency,
};
