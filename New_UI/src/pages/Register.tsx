import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, User, Phone, Upload, Users, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { register } from "@/lib/api"; // Changed from signUp to register

// Define UserRole locally if not available
type UserRole = 'passenger' | 'driver' | 'admin';

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [step, setStep] = useState<'select' | 'form'>('select');
  const [role, setRole] = useState<UserRole>('passenger');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [vehiclePhotoPreview, setVehiclePhotoPreview] = useState<string>("");

  useEffect(() => {
    const roleParam = searchParams.get('role') as UserRole;
    if (roleParam && (roleParam === 'passenger' || roleParam === 'driver')) {
      setRole(roleParam);
      setStep('form');
    }
  }, [searchParams]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    vehicleModel: "",
    licensePlate: "",
    vehicleCapacity: 4,
    vehiclePhoto: "",
  });

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setStep('form');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setFormData({ ...formData, vehiclePhoto: base64 });
        setVehiclePhotoPreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const userData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: role.toUpperCase(), // Backend expects uppercase enum
      password: formData.password, // Ensure password is sent
      ...(role === 'driver' && {
        vehicleModel: formData.vehicleModel,
        licensePlate: formData.licensePlate,
        // vehicleCapacity: Number(formData.vehicleCapacity), // Backend might not have this, check API later
        // vehiclePhoto: formData.vehiclePhoto, // Backend might not handle image yet
      }),
    };

    try {
      // Use API register function
      await register(userData);

      toast({
        title: "Account created!",
        description: "Welcome to RideConnect. Please sign in.",
      });

      // Redirect to sign in (or simulate login immediately if desired, but signin is safer)
      navigate('/signin');

    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.response?.data?.message || "Could not create account.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Animated border glow - Restored from Surya Code */}
        <motion.div
          className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-primary rounded-2xl opacity-75 blur-md"
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          style={{ backgroundSize: "200% 200%" }}
        />
        <div className="glass-card p-8 rounded-2xl relative bg-card border-none">
          {/* Logo - Restored from Surya Code */}
          <Link to="/" className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl overflow-hidden group-hover:scale-110 transition-transform duration-300">
              <img src="/logo.png" alt="RideConnect Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-display font-bold text-2xl">RideConnect</span>
          </Link>

          <AnimatePresence mode="wait">
            {step === 'select' && (
              <motion.div
                key="select"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <h1 className="text-2xl font-bold text-center mb-2">Get Started</h1>
                <p className="text-muted-foreground text-center mb-8">
                  Choose how you want to use RideConnect
                </p>

                <div className="space-y-4">
                  <button
                    onClick={() => handleRoleSelect('passenger')}
                    className="w-full p-6 rounded-xl border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary transition-all group shadow-lg hover:shadow-primary/20"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                        <Users className="w-7 h-7 text-primary" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-lg text-primary">Passenger</h3>
                        <p className="text-muted-foreground text-sm">Find and book rides</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleRoleSelect('driver')}
                    className="w-full p-6 rounded-xl border-2 border-accent/20 bg-accent/5 hover:bg-accent/10 hover:border-accent transition-all group shadow-lg hover:shadow-accent/20"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                        <Truck className="w-7 h-7 text-accent" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-lg text-accent">Driver</h3>
                        <p className="text-muted-foreground text-sm">Host and share rides</p>
                      </div>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'form' && (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <button
                  onClick={() => setStep('select')}
                  className="text-muted-foreground hover:text-foreground mb-4"
                >
                  ← Back
                </button>

                <h1 className="text-2xl font-bold text-center mb-2">
                  {role === 'passenger' ? 'Passenger' : 'Driver'} Registration
                </h1>
                <p className="text-muted-foreground text-center mb-8">
                  Enter your details
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="name"
                        name="name"
                        placeholder="Enter your name"
                        value={formData.name}
                        onChange={handleChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={formData.phone}
                        onChange={handleChange}
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
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={handleChange}
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

                  {role === 'driver' && (
                    <>
                      <div className="my-6">
                        <div className="h-px bg-border mb-6" />
                        <h3 className="text-xl font-semibold text-left mb-4">Vehicle Details</h3>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="vehicleModel">Vehicle Model</Label>
                        <Input
                          id="vehicleModel"
                          name="vehicleModel"
                          placeholder="e.g., Toyota Innova"
                          value={formData.vehicleModel}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="licensePlate">License Plate</Label>
                        <Input
                          id="licensePlate"
                          name="licensePlate"
                          placeholder="e.g., KA 01 AB 1234"
                          value={formData.licensePlate}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      {/* 
                      <div className="space-y-2">
                        <Label htmlFor="vehicleCapacity">Seating Capacity</Label>
                        <Input
                          id="vehicleCapacity"
                          name="vehicleCapacity"
                          type="number"
                          min="1"
                          max="10"
                          placeholder="Number of seats"
                          value={formData.vehicleCapacity}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Vehicle Photo</Label>
                        <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary transition-colors cursor-pointer relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                          {vehiclePhotoPreview ? (
                            <img
                              src={vehiclePhotoPreview}
                              alt="Vehicle preview"
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          ) : (
                            <>
                              <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                              <p className="text-muted-foreground text-sm">
                                Click to upload vehicle photo
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                      */}
                    </>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-center mt-6 text-muted-foreground">
            Already have an account?{" "}
            <Link to="/signin" className="text-accent hover:underline font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
