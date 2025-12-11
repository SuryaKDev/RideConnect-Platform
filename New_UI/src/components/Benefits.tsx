import { motion } from "framer-motion";
import { DollarSign, Leaf, Users, Shield, Clock, Zap } from "lucide-react";

const benefits = [
  {
    icon: DollarSign,
    title: "Save Money",
    description: "Split fuel costs and save up to 75% compared to driving alone or taking other transport.",
    gradient: "from-green-500/20 to-emerald-500/20",
    iconColor: "text-green-400",
  },
  {
    icon: Leaf,
    title: "Go Green",
    description: "Reduce your carbon footprint by sharing rides. Every shared journey means fewer cars on the road.",
    gradient: "from-primary/20 to-cyan-500/20",
    iconColor: "text-primary",
  },
  {
    icon: Users,
    title: "Build Community",
    description: "Meet like-minded travelers, network, and make new friends during your journeys.",
    gradient: "from-purple-500/20 to-pink-500/20",
    iconColor: "text-purple-400",
  },
  {
    icon: Shield,
    title: "Travel Safe",
    description: "Verified profiles, ratings, and reviews ensure you travel with trusted companions.",
    gradient: "from-accent/20 to-orange-500/20",
    iconColor: "text-accent",
  },
  {
    icon: Clock,
    title: "Flexible Timing",
    description: "Find rides that match your schedule. Thousands of trips posted daily across all routes.",
    gradient: "from-blue-500/20 to-indigo-500/20",
    iconColor: "text-blue-400",
  },
  {
    icon: Zap,
    title: "Instant Booking",
    description: "Book your seat in seconds with our streamlined process. No waiting, no hassle.",
    gradient: "from-yellow-500/20 to-amber-500/20",
    iconColor: "text-yellow-400",
  },
];

const Benefits = () => {
  return (
    <section id="benefits" className="py-24 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/30 to-transparent" />

      <div className="max-w-7xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Why Choose <span className="gradient-text">RideShare</span>?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience the future of travel with benefits that matter to you and the planet.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="glass-card p-8 h-full relative overflow-hidden hover:border-primary/30 transition-all duration-300">
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className="relative">
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-xl bg-secondary/80 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <benefit.icon className={`w-7 h-7 ${benefit.iconColor}`} />
                  </div>

                  <h3 className="font-display text-xl font-semibold mb-3">{benefit.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
