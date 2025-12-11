import { motion } from "framer-motion";
import { Clock, Users, IndianRupee, MapPin, ArrowRight } from "lucide-react";
import routeMapBg from "@/assets/route-map.png";

const FeaturedRoutes = () => {
  const routes = [
    { from: "Hyderabad", to: "Bangalore", price: "₹750", time: "6h", seats: 3, color: "from-cyan-500 to-blue-500" },
    { from: "Chennai", to: "Coimbatore", price: "₹600", time: "5h", seats: 2, color: "from-orange-500 to-red-500" },
    { from: "Pune", to: "Hyderabad", price: "₹800", time: "7h", seats: 4, color: "from-purple-500 to-pink-500" },
    { from: "Kochi", to: "Trivandrum", price: "₹500", time: "3h", seats: 2, color: "from-green-500 to-emerald-500" },
  ];

  return (
    <section id="routes" className="py-24 px-4 relative overflow-hidden">
      {/* Background Map */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url(${routeMapBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      
      {/* Animated Orbs */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-20 left-10 w-64 h-64 bg-primary/30 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, delay: 2 }}
        className="absolute bottom-20 right-10 w-80 h-80 bg-accent/20 rounded-full blur-3xl"
      />

      <div className="max-w-7xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 backdrop-blur-sm mb-6"
          >
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Trending Now</span>
          </motion.div>
          
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Popular <span className="gradient-text">Routes</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of travelers on these trending journeys across India
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {routes.map((route, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -12, scale: 1.03 }}
              className="group cursor-pointer"
            >
              <div className="glass-card p-6 h-full relative overflow-hidden border-2 border-transparent hover:border-primary/30 transition-all duration-500">
                {/* Animated gradient on hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                />
                
                {/* Shimmer effect */}
                <div className="absolute inset-0 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <motion.div
                    className="w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12"
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                  />
                </div>
                
                <div className="relative">
                  {/* Route visualization */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2 w-full">
                      <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${route.color} relative shadow-lg`}>
                        <motion.div
                          className={`absolute inset-0 rounded-full bg-gradient-to-r ${route.color}`}
                          animate={{ scale: [1, 2, 1], opacity: [0.8, 0, 0.8] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </div>
                      <div className={`flex-1 h-1 bg-gradient-to-r ${route.color} rounded-full relative overflow-hidden`}>
                        <motion.div
                          className="absolute inset-y-0 w-4 bg-white/50 rounded-full"
                          animate={{ x: [0, 100, 0] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                          style={{ left: "-10%" }}
                        />
                      </div>
                      <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${route.color} shadow-lg`} />
                    </div>
                  </div>

                  {/* Cities */}
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">From</div>
                      <div className="font-display font-bold text-lg group-hover:text-primary transition-colors">{route.from}</div>
                    </div>
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="mt-3"
                    >
                      <ArrowRight className="w-5 h-5 text-muted-foreground" />
                    </motion.div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">To</div>
                      <div className="font-display font-bold text-lg group-hover:text-accent transition-colors">{route.to}</div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex justify-between items-center pt-4 border-t border-border/50">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{route.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>{route.seats}</span>
                      </div>
                    </div>
                    <div className="flex items-center font-display font-bold text-xl gradient-text">
                      {route.price}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Routes Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 backdrop-blur-sm font-display font-semibold text-foreground hover:border-primary/50 transition-all duration-300 group"
          >
            View All Routes
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedRoutes;