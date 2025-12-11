import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Users, ArrowRight, Sparkles, Navigation, Route } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import carSilhouette from "@/assets/car-silhouette.png";
import ParticleField from "./ParticleField";
import AnimatedRoad from "./AnimatedRoad";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16 px-4">
      {/* Hero Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/80 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background/80" />
      </div>

      {/* Particle Field */}
      <ParticleField />

      {/* Animated Road Lines */}
      <AnimatedRoad />
      
      {/* Floating Orbs */}
      <motion.div
        animate={{ 
          y: [0, -30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ 
          y: [0, 30, 0],
          scale: [1, 0.9, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/15 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ 
          x: [0, 20, 0],
          y: [0, -20, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 right-1/3 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl"
      />

      <div className="relative max-w-7xl mx-auto w-full z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center lg:text-left"
          >

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6"
            >
              Share Your{" "}
              <span className="gradient-text relative">
                Journey
                <motion.span
                  className="absolute -inset-1 bg-primary/20 blur-2xl rounded-full"
                  animate={{ opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </span>
              <br />
              <span className="text-foreground/90">Save the Planet</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0"
            >
              Connect with fellow travelers heading your way. Split costs, reduce emissions, and make every ride count.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button variant="hero" size="xl" className="group relative overflow-hidden">
                <span className="relative z-10 flex items-center gap-2">
                  Find a Ride
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary via-cyan-400 to-primary"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  style={{ opacity: 0.3 }}
                />
              </Button>
              <Button variant="glass" size="xl" className="group">
                <Route className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                Offer a Ride
              </Button>
            </motion.div>

          </motion.div>

          {/* Right - Search Card with Car Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50, rotateY: -10 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
            className="relative perspective-1000"
          >

            <div className="glass-card p-8 relative group">
              {/* Animated border glow */}
              <motion.div 
                className="absolute -inset-[1px] bg-gradient-to-r from-primary via-accent to-primary rounded-2xl opacity-50 blur-sm"
                animate={{ 
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                style={{ backgroundSize: "200% 200%" }}
              />
              
              <div className="relative bg-card rounded-2xl p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-2xl font-semibold">Find Your Perfect Ride</h3>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 rounded-full border-2 border-dashed border-primary/30 flex items-center justify-center"
                  >
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </motion.div>
                </div>

                {/* From */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">From</label>
                  <motion.div 
                    className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50 border border-border/50 focus-within:border-primary/50 transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="relative">
                      <MapPin className="w-5 h-5 text-primary" />
                      <motion.div
                        className="absolute inset-0 bg-primary rounded-full"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Enter pickup location"
                      className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                    />
                  </motion.div>
                </div>

                {/* Animated connector */}
                <div className="flex justify-center">
                  <motion.div
                    className="w-0.5 h-8 bg-gradient-to-b from-primary via-transparent to-accent"
                    animate={{ scaleY: [1, 0.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>

                {/* To */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">To</label>
                  <motion.div 
                    className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50 border border-border/50 focus-within:border-accent/50 transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="relative">
                      <MapPin className="w-5 h-5 text-accent" />
                      <motion.div
                        className="absolute inset-0 bg-accent rounded-full"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Enter destination"
                      className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                    />
                  </motion.div>
                </div>

                {/* Date & Passengers */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Date</label>
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50 border border-border/50 focus-within:border-primary/50 transition-colors">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Select date"
                        className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Passengers</label>
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50 border border-border/50 focus-within:border-primary/50 transition-colors">
                      <Users className="w-5 h-5 text-muted-foreground" />
                      <select className="flex-1 bg-transparent outline-none text-foreground text-sm">
                        <option value="1">1 Person</option>
                        <option value="2">2 People</option>
                        <option value="3">3 People</option>
                        <option value="4">4 People</option>
                      </select>
                    </div>
                  </div>
                </div>

                <Button variant="accent" size="lg" className="w-full group relative overflow-hidden">
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Search Rides
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
