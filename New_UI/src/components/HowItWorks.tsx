import { motion } from "framer-motion";
import { Search, Route, CreditCard, Star } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Search Your Route",
    description: "Enter your pickup and drop-off locations. Our smart algorithm finds the best matches instantly.",
    color: "primary",
  },
  {
    icon: Route,
    title: "Choose Your Ride",
    description: "Browse available rides, check driver ratings, and pick the one that suits your schedule and budget.",
    color: "accent",
  },
  {
    icon: CreditCard,
    title: "Book & Pay Securely",
    description: "Confirm your seat with our secure payment system. Dynamic pricing ensures fair fares for everyone.",
    color: "primary",
  },
  {
    icon: Star,
    title: "Travel & Review",
    description: "Enjoy your journey and share your experience. Your feedback helps build a trusted community.",
    color: "accent",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_50%,hsl(174_72%_15%/0.2)_0%,transparent_50%)]" />

      <div className="max-w-7xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            How <span className="gradient-text">RideShare</span> Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get on the road in four simple steps. It's fast, easy, and eco-friendly.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="relative group"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-border via-primary/30 to-border" />
              )}

              <div className="glass-card p-8 h-full relative hover:border-primary/30 transition-all duration-300 group-hover:translate-y-[-4px]">
                {/* Step Number */}
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center font-display font-bold text-sm">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl mb-6 flex items-center justify-center ${
                  step.color === "primary" 
                    ? "bg-primary/10 group-hover:bg-primary/20" 
                    : "bg-accent/10 group-hover:bg-accent/20"
                } transition-colors duration-300`}>
                  <step.icon className={`w-8 h-8 ${
                    step.color === "primary" ? "text-primary" : "text-accent"
                  }`} />
                </div>

                <h3 className="font-display text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
