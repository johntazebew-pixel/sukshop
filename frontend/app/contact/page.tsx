import Link from 'next/link';
import { ArrowLeft, Phone, Mail, MapPin, Send, MessageSquare, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export const metadata = {
  title: 'Contact Us | ሱቅShop',
  description: 'Get in touch with the ሱቅShop support and sales team in Addis Ababa.',
};

export default function ContactPage() {
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
          Get in Touch
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold">
          Contact <span className="gradient-text">Our Team</span>
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Have questions about a phone, your order, or need help? We're here for you.
        </p>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Info Column */}
        <div className="md:col-span-1 space-y-4">
          <ContactCard
            icon={Phone}
            title="Call Us"
            value="+251 911 223 344"
            desc="Mon-Sat, 9am - 8pm"
          />
          <ContactCard
            icon={Send}
            title="Telegram"
            value="@sukshop_support"
            desc="Fastest response time"
          />
          <ContactCard
            icon={Mail}
            title="Email"
            value="support@sukshop.com"
            desc="Within 24 hours"
          />
          <ContactCard
            icon={MapPin}
            title="Store Location"
            value="Bole, Addis Ababa"
            desc="Ethiopia"
          />
        </div>

        {/* Message Form */}
        <div className="md:col-span-2 rounded-2xl border border-primary/10 bg-white p-6 sm:p-8">
          <h2 className="text-lg sm:text-xl font-bold mb-1">Send us a Message</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mb-5">
            Fill out the form below and we'll get back to you promptly.
          </p>

          <form className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Your Name</label>
                <Input
                  placeholder="Abebe Kebede"
                  className="h-10 rounded-xl text-xs sm:text-sm border-primary/15"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Phone Number</label>
                <Input
                  placeholder="+251 9..."
                  className="h-10 rounded-xl text-xs sm:text-sm border-primary/15"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Email Address</label>
              <Input
                type="email"
                placeholder="abebe@example.com"
                className="h-10 rounded-xl text-xs sm:text-sm border-primary/15"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Message</label>
              <Textarea
                placeholder="Tell us what phone you're looking for or your order inquiry..."
                rows={4}
                className="rounded-xl text-xs sm:text-sm border-primary/15 resize-none"
              />
            </div>

            <Button
              type="submit"
              size="default"
              className="w-full sm:w-auto rounded-full px-6 h-10 sm:h-11 bg-gradient-to-r from-primary to-accent font-semibold text-xs sm:text-sm shadow-md"
            >
              <Send className="mr-1.5 h-3.5 w-3.5" />
              Send Message
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

function ContactCard({
  icon: Icon,
  title,
  value,
  desc,
}: {
  icon: any;
  title: string;
  value: string;
  desc: string;
}) {
  return (
    <div className="p-4 rounded-xl sm:rounded-2xl bg-white border border-primary/10 flex items-start gap-3">
      <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">{title}</p>
        <p className="font-semibold text-xs sm:text-sm text-foreground truncate">{value}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{desc}</p>
      </div>
    </div>
  );
}
