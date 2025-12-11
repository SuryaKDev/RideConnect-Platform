import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Mitchell",
    role: "Regular Commuter",
    avatar: "SM",
    rating: 5,
    text: "RideShare has transformed my daily commute. I've saved over $300 a month and made amazing friends along the way!",
  },
  {
    name: "James Chen",
    role: "Driver Partner",
    avatar: "JC",
    rating: 5,
    text: "As a driver, I earn extra income on trips I'm already making. The platform is incredibly easy to use and passengers are great.",
  },
  {
    name: "Emma Rodriguez",
    role: "Weekend Traveler",
    avatar: "ER",
    rating: 5,
    text: "I travel between cities every weekend. RideShare makes it affordable and actually enjoyable. Love the verified profiles feature!",
  },
  {
    name: "Michael Park",
    role: "Student",
    avatar: "MP",
    rating: 5,
    text: "As a student, every penny counts. RideShare helps me get home for holidays at a fraction of the cost. Highly recommend!",
  },
];

const Testimonials = () => {
  return (
    <section id="reviews" className="py-24 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/20 via-transparent to-secondary/20" />

      <div className="max-w-7xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Loved by <span className="gradient-text">Millions</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join our community of happy riders and drivers sharing the road together.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="glass-card p-6 h-full relative hover:border-primary/30 transition-all duration-300">
                {/* Quote Icon */}
                <Quote className="w-8 h-8 text-primary/20 absolute top-4 right-4" />

                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                  ))}
                </div>

                {/* Text */}
                <p className="text-muted-foreground mb-6 leading-relaxed">"{testimonial.text}"</p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-display font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-display font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass-card p-8 mt-16"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "4.9", label: "Average Rating" },
              { value: "2M+", label: "Happy Users" },
              { value: "10M+", label: "Trips Completed" },
              { value: "99%", label: "Satisfaction Rate" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="font-display text-3xl sm:text-4xl font-bold gradient-text">{stat.value}</div>
                <div className="text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
