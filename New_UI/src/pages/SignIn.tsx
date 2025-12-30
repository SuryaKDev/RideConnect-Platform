import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { login } from "@/lib/api";

const SignIn = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = await login({ email, password });
      
      // Save the entire user object (including token) to localStorage
      localStorage.setItem('rideconnect_current_user', JSON.stringify(user));
      
      toast({
        title: "Welcome back!",
        description: `Signed in as ${user.name || user.email}`,
      });
      
      // Redirect based on role
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else if (user.role === 'DRIVER') {
        navigate('/driver-dashboard');
      } else {
        navigate('/passenger-dashboard');
      }
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.response?.data?.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-card p-8 rounded-2xl">
          {/* Logo */}
          <Link to="/" className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              {/* Logo placeholder */}
              <Car className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-2xl">RideConnect</span>
          </Link>

          <h1 className="text-2xl font-bold text-center mb-2">Welcome Back</h1>
          <p className="text-muted-foreground text-center mb-8">
            Sign in to your account
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="text-center mt-6 text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary hover:underline font-medium">
              Get Started
            </Link>
          </p>

          <div className="mt-6 p-4 rounded-lg bg-muted/50 text-sm">
            <p className="font-medium mb-2">Demo Credentials:</p>
            <p className="text-muted-foreground">Admin: admin@rideconnect.com / admin123</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignIn;
