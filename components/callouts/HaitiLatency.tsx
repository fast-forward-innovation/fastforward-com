import { useId } from "react";

/**
 * Dark blog callout: Haiti latency and download speeds.
 * Spec: docs/design/callouts/haiti-latency.dc.html. Data and source line are
 * from docs/design/callouts/README.md — change them only against the source.
 *
 * The bars are decorative (aria-hidden); each row's label and value are real
 * text in a list, which is the chart's screen-reader equivalent.
 */
const SPEEDS = [
  { label: "Haiti, all devices", mbps: 6.9, tone: "haiti" },
  { label: "Haiti, on mobile", mbps: 2, tone: "haiti" },
  { label: "Global median", mbps: 33.9, tone: "global" },
] as const;

const MAX_MBPS = Math.max(...SPEEDS.map((s) => s.mbps));

export function HaitiLatency() {
  const titleId = useId();
  const chartId = useId();

  return (
    <div className="ff-callout">
      <aside
        className="ff-callout__card ff-callout--dark"
        aria-labelledby={titleId}
      >
        <div className="ff-callout__body">
          <div className="ff-callout__head">
            <p className="ff-callout__eyebrow">Who the site is built for</p>
            <p id={titleId} className="ff-callout__title">
              Every click costs more in Haiti.
            </p>
          </div>

          <div className="ff-callout__stats">
            <div className="ff-callout__latency">
              <p className="ff-callout__big">
                <span className="ff-callout__big-num">101</span>{" "}
                <span className="ff-callout__big-unit">ms</span>
              </p>
              <p className="ff-callout__big-label">
                median latency: the wait before anything starts to load
              </p>
            </div>

            <div className="ff-callout__chart">
              <p id={chartId} className="ff-callout__chart-label">
                Median download speed
              </p>
              <ul className="ff-callout__bars" aria-labelledby={chartId}>
                {SPEEDS.map((s) => (
                  <li
                    key={s.label}
                    className={`ff-callout__bar-row ff-callout__bar-row--${s.tone}`}
                  >
                    <span className="ff-callout__bar-text">
                      <span>{s.label}</span>
                      <span>{s.mbps} Mbps</span>
                    </span>
                    <span className="ff-callout__track" aria-hidden>
                      <span
                        className="ff-callout__fill"
                        style={{ width: `${(s.mbps / MAX_MBPS) * 100}%` }}
                      />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="ff-callout__lede">
            So we built for fewer round trips: one small index, filtering in
            the browser, and saved lists that survive a dropped connection.
          </p>

          <div className="ff-callout__footer">
            <span>
              Source: SpeedOf.Me, Haiti, first half of 2026. Medians of
              browser-based tests (fewer than 1,000).
            </span>
            <span className="ff-callout__brand">fastforward.sh</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
