import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, X, Car } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "How it Works", href: "#how-it-works" },
    { name: "Benefits", href: "#benefits" },
    { name: "Routes", href: "#routes" },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 px-4 py-4"
    >
      <div className="max-w-7xl mx-auto">
        <div className="glass-card px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group">
            {/* Logo placeholder - replace src with your logo image */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 overflow-hidden">
              {/* Replace this div with: <img src="/your-logo.png" alt="RideConnect Logo" className="w-full h-full object-cover" /> */}
              <Car className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">
              Ride<span className="gradient-text">Connect</span>
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-muted-foreground hover:text-foreground transition-colors duration-300 font-medium"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/signin"><Button variant="ghost">Sign In</Button></Link>
            <Link to="/register"><Button variant="hero">Get Started</Button></Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-foreground"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card mt-2 p-6 md:hidden"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-muted-foreground hover:text-foreground transition-colors duration-300 font-medium py-2"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <div className="flex flex-col gap-3 pt-4 border-t border-border">
                <Link to="/signin"><Button variant="ghost" className="w-full">Sign In</Button></Link>
                <Link to="/register"><Button variant="hero" className="w-full">Get Started</Button></Link>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
