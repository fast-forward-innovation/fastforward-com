"use client";

// Chart A — PHP vs JavaScript/Node web share, 2007–2026 (long view).
// Source: W3Techs. Pre-2010 PHP and pre-2013 Node points are estimates.

import { useEffect, useRef } from "react";
import type { Chart as ChartType } from "chart.js";

const LABELS = [
  "2007",
  "2009",
  "2011",
  "2013",
  "2015",
  "2017",
  "2019",
  "2021",
  "2023",
  "2025",
  "2026",
];
const PHP = [68, 72, 77, 81.5, 81.8, 80.1, 79.2, 78.9, 77.2, 73.0, 71.8];
const JS = [0, 0, 0.1, 0.3, 0.6, 1.0, 1.8, 2.6, 3.1, 4.6, 5.0];

export function PhpJsShareLongView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let chart: ChartType | undefined;
    let cancelled = false;
    const styles = getComputedStyle(document.documentElement);
    const tick = styles.getPropertyValue("--color-ff_gray").trim() || "#7f7d81";
    const grid =
      styles.getPropertyValue("--color-ff_lightGray").trim() || "#edf1f2";

    import("chart.js/auto").then(({ default: Chart }) => {
      if (cancelled || !canvasRef.current) return;
      chart = new Chart(canvasRef.current, {
        type: "line",
        data: {
          labels: LABELS,
          datasets: [
            {
              label: "PHP",
              data: PHP,
              borderColor: "#2a78d6",
              backgroundColor: "#2a78d6",
              borderWidth: 2,
              tension: 0.3,
              pointRadius: 3,
            },
            {
              label: "JavaScript / Node",
              data: JS,
              borderColor: "#eda100",
              backgroundColor: "#eda100",
              borderWidth: 2,
              borderDash: [6, 4],
              tension: 0.3,
              pointRadius: 3,
              pointStyle: "rectRot",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: "top",
              labels: { usePointStyle: true, boxWidth: 8, font: { size: 12 } },
            },
            tooltip: {
              callbacks: {
                label: (c) => `${c.dataset.label}: ${c.parsed.y}%`,
              },
            },
          },
          scales: {
            y: {
              min: 0,
              max: 90,
              ticks: { callback: (v) => v + "%", color: tick },
              grid: { color: grid },
            },
            x: {
              ticks: { color: tick, autoSkip: false, maxRotation: 45 },
              grid: { display: false },
            },
          },
        },
      });
    });
    return () => {
      cancelled = true;
      if (chart) chart.destroy();
    };
  }, []);

  return (
    <figure className="ff-chart" style={{ marginBlock: "2.5rem" }}>
      <div style={{ position: "relative", width: "100%", height: 340 }}>
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Line chart of web platform share from 2007 to 2026. PHP rises from about 68 percent to a peak near 82 percent around 2013, then declines to about 72 percent. JavaScript/Node stays near zero until about 2013 then rises to about 5 percent."
        />
      </div>
      <figcaption
        style={{ fontSize: 12, color: "var(--color-ff_gray)", marginTop: 8 }}
      >
        PHP vs JavaScript/Node share of sites with a known server-side language.
        W3Techs tracking begins 2010; Node.js launched 2009 — earlier points are
        estimates shown for context.
      </figcaption>
    </figure>
  );
}
