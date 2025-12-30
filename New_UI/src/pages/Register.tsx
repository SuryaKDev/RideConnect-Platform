import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Car, User, Phone, Upload, Users, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { signUp, UserRole } from "@/lib/auth";

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<'select' | 'form' | 'vehicle'>('select');
  const [role, setRole] = useState<UserRole>('passenger');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [vehiclePhotoPreview, setVehiclePhotoPreview] = useState<string>("");

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
    
    if (role === 'driver' && step === 'form') {
      setStep('vehicle');
      return;
    }

    setIsLoading(true);

    const userData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role,
      ...(role === 'driver' && {
        vehicleModel: formData.vehicleModel,
        licensePlate: formData.licensePlate,
        vehicleCapacity: Number(formData.vehicleCapacity),
        vehiclePhoto: formData.vehiclePhoto,
      }),
    };

    const result = signUp(userData);

    if (result.success) {
      toast({
        title: "Account created!",
        description: "Welcome to RideConnect",
      });
      
      if (role === 'driver') {
        navigate('/driver-dashboard');
      } else {
        navigate('/passenger-dashboard');
      }
    } else {
      toast({
        title: "Registration failed",
        description: result.error,
        variant: "destructive",
      });
    }

    setIsLoading(false);
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
              <Car className="w-6 h-6 text-primary-foreground" />
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
                    className="w-full p-6 rounded-xl border-2 border-border hover:border-primary transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Users className="w-7 h-7 text-primary" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-lg">Passenger</h3>
                        <p className="text-muted-foreground text-sm">Find and book rides</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleRoleSelect('driver')}
                    className="w-full p-6 rounded-xl border-2 border-border hover:border-primary transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                        <Truck className="w-7 h-7 text-accent-foreground" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-lg">Driver</h3>
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

                  <Button type="submit" className="w-full">
                    {role === 'driver' ? 'Next: Vehicle Details' : 'Create Account'}
                  </Button>
                </form>
              </motion.div>
            )}

            {step === 'vehicle' && (
              <motion.div
                key="vehicle"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <button
                  onClick={() => setStep('form')}
                  className="text-muted-foreground hover:text-foreground mb-4"
                >
                  ← Back
                </button>

                <h1 className="text-2xl font-bold text-center mb-2">Vehicle Details</h1>
                <p className="text-muted-foreground text-center mb-8">
                  Tell us about your vehicle
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
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

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-center mt-6 text-muted-foreground">
            Already have an account?{" "}
            <Link to="/signin" className="text-primary hover:underline font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
