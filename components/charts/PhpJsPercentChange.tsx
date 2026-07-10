"use client";

// Chart C — Percent change in web share since 2017, PHP vs JavaScript/Node.
// Indexed to 2017 = 0%. Source: W3Techs.

import { useEffect, useRef } from "react";
import type { Chart as ChartType } from "chart.js";

const LABELS = ["2017", "2019", "2021", "2022", "2024", "2026"];
const PHP = [0, -1.1, -1.5, -1.5, -6.5, -10.4];
const JS = [0, 80, 160, 210, 300, 400];

export function PhpJsPercentChange() {
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
                label: (c) => {
                  const y = c.parsed.y ?? 0;
                  return `${c.dataset.label}: ${y > 0 ? "+" : ""}${y}%`;
                },
              },
            },
          },
          scales: {
            y: {
              ticks: {
                callback: (v) => (Number(v) > 0 ? "+" : "") + v + "%",
                color: tick,
              },
              grid: { color: grid },
            },
            x: {
              ticks: { color: tick },
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
      <div style={{ position: "relative", width: "100%", height: 320 }}>
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Line chart of percent change in web platform share since 2017. PHP declines gradually to about minus 10 percent by 2026. JavaScript/Node rises sharply to about plus 400 percent."
        />
      </div>
      <figcaption
        style={{ fontSize: 12, color: "var(--color-ff_gray)", marginTop: 8 }}
      >
        Percent change in each platform&apos;s web share, indexed to 2017 = 0%.
        Measures relative change, not absolute size. Source: W3Techs.
      </figcaption>
    </figure>
  );
}
