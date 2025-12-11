import { motion } from "framer-motion";

const AnimatedRoad = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Animated road lines */}
      <svg
        className="absolute bottom-0 left-0 w-full h-full opacity-20"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Main curved road path */}
        <defs>
          <linearGradient id="roadGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(174, 72%, 56%)" stopOpacity="0" />
            <stop offset="50%" stopColor="hsl(174, 72%, 56%)" stopOpacity="1" />
            <stop offset="100%" stopColor="hsl(32, 95%, 55%)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(174, 72%, 56%)" stopOpacity="0" />
            <stop offset="50%" stopColor="hsl(174, 72%, 56%)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="hsl(174, 72%, 56%)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Multiple animated road lines */}
        {[0, 1, 2].map((i) => (
          <motion.path
            key={i}
            d="M-100,900 Q400,700 600,600 T1000,450 T1400,350 T1920,200"
            fill="none"
            stroke="url(#roadGradient)"
            strokeWidth={2 - i * 0.5}
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: 1, 
              opacity: [0, 0.6, 0.6, 0],
            }}
            transition={{
              duration: 4,
              delay: i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              filter: "drop-shadow(0 0 8px hsl(174, 72%, 56%))",
            }}
          />
        ))}

        {/* Glowing dots moving along path */}
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.circle
            key={`dot-${i}`}
            r={3}
            fill="hsl(174, 72%, 56%)"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 3,
              delay: i * 0.8,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              filter: "drop-shadow(0 0 10px hsl(174, 72%, 56%))",
            }}
          >
            <animateMotion
              dur={`${3 + i * 0.2}s`}
              repeatCount="indefinite"
              path="M-100,900 Q400,700 600,600 T1000,450 T1400,350 T1920,200"
            />
          </motion.circle>
        ))}
      </svg>

      {/* Additional ambient lines */}
      <svg
        className="absolute top-0 right-0 w-full h-full opacity-10"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
      >
        {[0, 1].map((i) => (
          <motion.path
            key={`secondary-${i}`}
            d="M1920,100 Q1500,200 1200,350 T800,500 T400,700 T-100,900"
            fill="none"
            stroke="hsl(32, 95%, 55%)"
            strokeWidth={1.5 - i * 0.5}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 5,
              delay: 1 + i * 0.3,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut",
            }}
            style={{
              filter: "drop-shadow(0 0 6px hsl(32, 95%, 55%))",
            }}
          />
        ))}
      </svg>
    </div>
  );
};

export default AnimatedRoad;
