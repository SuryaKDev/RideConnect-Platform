import { motion } from "framer-motion";
import carImage from "@/assets/car-silhouette.png";

const CarShowcase = () => {
  return (
    <section className="py-32 px-4 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
      
      {/* Animated lines */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
            style={{
              top: `${20 + i * 15}%`,
              width: "150%",
              left: "-25%",
            }}
            animate={{
              x: ["-10%", "10%", "-10%"],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Car Image */}
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative"
          >
            {/* Glow behind car */}
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full transform scale-75" />
            
            <motion.img
              src={carImage}
              alt="Futuristic car"
              className="relative z-10 w-full"
              animate={{
                y: [0, -15, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Speed lines */}
            <motion.div
              className="absolute top-1/2 -left-20 -translate-y-1/2 space-y-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className="h-0.5 bg-gradient-to-r from-primary to-transparent"
                  style={{ width: 60 + i * 20 }}
                  animate={{
                    x: [-20, 0, -20],
                    opacity: [0.3, 0.8, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </motion.div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-center lg:text-left"
          >
            <motion.h2 
              className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              The Future of{" "}
              <span className="gradient-text">Shared Mobility</span>
            </motion.h2>

            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Experience seamless carpooling with smart route matching, dynamic fare calculation, 
              and a community built on trust. Every journey brings us closer to a sustainable future.
            </p>

            <div className="grid grid-cols-2 gap-6">
              {[
                { value: "40%", label: "Less Traffic" },
                { value: "60%", label: "Cost Savings" },
                { value: "50%", label: "Lower Emissions" },
                { value: "100%", label: "Verified Drivers" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * index }}
                  className="glass-card p-4 text-center"
                >
                  <div className="font-display text-2xl font-bold gradient-text">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CarShowcase;
