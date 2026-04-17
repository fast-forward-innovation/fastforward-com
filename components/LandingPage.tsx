import Image from "next/image";
import Link from "next/link";
import type { Page as PageData } from "@/lib/types";
import { FeaturedProjects } from "./page_blocks/FeaturedProjects";

const FEATURES = [
  {
    icon: "🚀",
    title: "Fast Delivery",
    description: "Rapid turnaround without compromising quality.",
  },
  {
    icon: "💎",
    title: "Premium Quality",
    description: "Every line of code is crafted with precision.",
  },
  {
    icon: "🤝",
    title: "Partnership Approach",
    description: "We work as your strategic partner.",
  },
];

export function LandingPage({ page }: { page: PageData }) {
  const { title, contentHtml, featuredImage } = page;

  return (
    <div className="landing-page">
      {/* Hero */}
      <section className="hero-section relative overflow-hidden bg-gradient-to-br from-ff_teal">
        <div className="section-wide py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
              {title || "Transform Your Business"}
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              We design and develop cutting-edge software solutions that drive
              growth and innovation.
            </p>
            <Link
              href="/contact-us"
              className="inline-block bg-white text-ff_teal px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors duration-300"
            >
              Get Started
            </Link>
          </div>
        </div>

        {featuredImage && (
          <div className="absolute inset-0 z-[-1]">
            <Image
              src={featuredImage.src}
              alt={featuredImage.alt || title}
              fill
              sizes="100vw"
              className="object-cover opacity-20"
            />
          </div>
        )}
      </section>

      {/* Features */}
      <section className="features-section py-16 bg-white">
        <div className="section-wide">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Why Choose Fast Forward?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We combine technical expertise with creative design to deliver
                software solutions that exceed expectations.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {FEATURES.map((f) => (
                <div key={f.title} className="text-center p-6">
                  <div className="text-6xl mb-6">{f.icon}</div>
                  <h3 className="text-2xl font-bold mb-4">{f.title}</h3>
                  <p className="text-gray-600">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WP content */}
      {contentHtml && (
        <section className="section main-section">
          <div className="mx-auto">
            <div className="lg:w-4/5">
              <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
            </div>
          </div>
        </section>
      )}

      <FeaturedProjects />
    </div>
  );
}
