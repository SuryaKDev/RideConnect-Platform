import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Shield, UserCheck, MapPin, Phone, BadgeCheck, Lock } from "lucide-react";

const safetyFeatures = [
  {
    icon: UserCheck,
    title: "Verified Profiles",
    description: "All users verify their identity with ID and phone number.",
  },
  {
    icon: BadgeCheck,
    title: "Community Ratings",
    description: "See reviews from real travelers before booking.",
  },
  {
    icon: MapPin,
    title: "Live Tracking",
    description: "Share your trip location with trusted contacts.",
  },
  {
    icon: Phone,
    title: "24/7 Support",
    description: "Our team is always available if you need help.",
  },
  {
    icon: Lock,
    title: "Secure Payments",
    description: "Your financial data is encrypted and protected.",
  },
  {
    icon: Shield,
    title: "Insurance Coverage",
    description: "Travel with peace of mind on every journey.",
  },
];

const Safety = () => {
  return (
    <section id="safety" className="py-24 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,hsl(32_95%_30%/0.15)_0%,transparent_50%)]" />

      <div className="max-w-7xl mx-auto relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
              <Shield className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">Your Safety First</span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Travel with{" "}
              <span className="gradient-text">Confidence</span>
            </h2>

            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              We've built multiple layers of security to ensure every ride is safe, transparent, and trustworthy. From verified profiles to live trip tracking, your safety is our priority.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button variant="accent" size="lg">
                Learn More About Safety
              </Button>
              <Button variant="glass" size="lg">
                View Trust Guidelines
              </Button>
            </div>
          </motion.div>

          {/* Right - Feature Grid */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 gap-4"
          >
            {safetyFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                className="glass-card p-5 hover:border-accent/30 transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                  <feature.icon className="w-5 h-5 text-accent" />
                </div>
                <h4 className="font-display font-semibold mb-1">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Safety;
