import Link from 'next/link';
import { ArrowLeft, ArrowRight, Smartphone, ShieldCheck, Truck, Headphones, Award, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'About Us | ሱቅShop',
  description: "Ethiopia's premier smartphone store providing genuine phones with warranty.",
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {/* Back button */}
      <div className="mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Home
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8 sm:mb-10 text-center max-w-2xl mx-auto">
        <span className="inline-block text-primary font-bold text-xs uppercase tracking-widest mb-1.5 px-3 py-1 rounded-full bg-secondary">
          Our Story
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold">
          About <span className="gradient-text">ሱቅShop</span>
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Ethiopia's trusted destination for authentic smartphones, transparent pricing, and fast local delivery.
        </p>
      </div>

      {/* Story Card */}
      <div className="rounded-2xl border border-primary/10 bg-white p-6 sm:p-8 mb-8 sm:mb-10 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div>
            <h2 className="text-lg sm:text-xl font-bold mb-3">
              Bringing World-Class Mobile Tech to Ethiopia
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4">
              Founded with a mission to make modern technology accessible and reliable, ሱቅShop connects consumers in Addis Ababa and across Ethiopia with original smartphones from leading global brands including Apple, Samsung, Xiaomi, and Google.
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Every device we offer comes with authenticity verification, full local warranty, and convenient payment methods including Cash on Delivery.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <StatCard value="10,000+" label="Happy Customers" />
            <StatCard value="100%" label="Original Devices" />
            <StatCard value="24-48h" label="Addis Delivery" />
            <StatCard value="1 Year" label="Official Warranty" />
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="max-w-4xl mx-auto mb-10">
        <div className="text-center mb-6">
          <span className="inline-block text-primary font-bold text-xs uppercase tracking-widest mb-1.5 px-3 py-1 rounded-full bg-secondary">
            Why Choose Us
          </span>
          <h2 className="text-xl sm:text-2xl font-bold">
            The <span className="gradient-text">ሱቅShop Promise</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <ValueCard
            icon={ShieldCheck}
            title="100% Authentic"
            desc="Direct sourcing from official distributors with verified serials and IMEIs."
          />
          <ValueCard
            icon={Truck}
            title="Fast Local Delivery"
            desc="Same-day or next-day delivery right to your doorstep across Addis Ababa."
          />
          <ValueCard
            icon={Award}
            title="Warranty Protection"
            desc="Full 1-year warranty coverage on all new smartphones."
          />
          <ValueCard
            icon={Smartphone}
            title="Best Price Guarantee"
            desc="Competitive market prices in Ethiopian Birr with no hidden fees."
          />
          <ValueCard
            icon={Headphones}
            title="24/7 Dedicated Support"
            desc="Telegram and phone support ready to assist you anytime."
          />
          <ValueCard
            icon={Users}
            title="Community First"
            desc="Building long-term trust with our tech community throughout Ethiopia."
          />
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-4xl mx-auto rounded-2xl jade-gradient p-6 sm:p-8 text-center text-white shadow-xl shadow-primary/20">
        <h2 className="text-xl sm:text-2xl font-bold mb-2">Ready to explore our catalog?</h2>
        <p className="text-xs sm:text-sm text-white/85 mb-5 max-w-md mx-auto">
          Discover the latest iPhones, Galaxies, and more at unbeatable prices.
        </p>
        <Button
          asChild
          size="default"
          className="rounded-full px-6 h-10 sm:h-11 bg-white text-primary hover:bg-secondary font-semibold text-xs sm:text-sm shadow-md"
        >
          <Link href="/phones">
            Explore Phones <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="p-4 rounded-xl bg-secondary/40 border border-primary/10 text-center">
      <p className="text-lg sm:text-xl font-bold gradient-text">{value}</p>
      <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

function ValueCard({
  icon: Icon,
  title,
  desc,
}: {
  icon: any;
  title: string;
  desc: string;
}) {
  return (
    <div className="group flex items-start gap-3 p-4 rounded-xl sm:rounded-2xl bg-white border border-primary/10 hover:border-primary/25 transition-all duration-300">
      <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <h3 className="font-semibold text-xs sm:text-sm text-foreground">{title}</h3>
        <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
