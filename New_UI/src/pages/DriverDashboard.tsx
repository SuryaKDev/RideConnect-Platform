import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Car, Plus, MapPin, Calendar, Clock, Users, LogOut, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { postRide, getMyRides } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Interface for Ride matching API
interface Ride {
  id: number;
  source: string;
  destination: string;
  date: string;
  time: string;
  pricePerSeat: number;
  availableSeats: number;
  status?: string;
  passengers?: any[]; // The API might not return this nested, but Surya's UI used it for stats. We'll handle gracefully.
}

const DriverDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<{ name: string; email: string; vehicleModel?: string; licensePlate?: string; vehicleCapacity?: number } | null>(null);
  const [rides, setRides] = useState<Ride[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Note: Surya's UI had a "duration" field, but logic API might not. We will optionally include it.
  const [newRide, setNewRide] = useState({
    source: "",
    destination: "",
    date: "",
    time: "",
    pricePerSeat: "",
    availableSeats: "4",
    vehicleModel: "", // Logic API requires this
  });

  useEffect(() => {
    const userDataString = localStorage.getItem("rideconnect_current_user");
    if (!userDataString) {
      navigate("/signin");
      return;
    }
    try {
      const userData = JSON.parse(userDataString);
      setUser(userData);
      // Pre-fill vehicle model if available in user profile
      if (userData.vehicleModel) {
        setNewRide(prev => ({ ...prev, vehicleModel: userData.vehicleModel }));
      }
      loadRides();
    } catch (e) {
      console.error(e);
      navigate("/signin");
    }
  }, [navigate]);

  const loadRides = async () => {
    try {
      const data = await getMyRides();
      // Ensure data is array
      if (Array.isArray(data)) {
        setRides(data);
      }
    } catch (error) {
      console.error("Failed to load rides", error);
    }
  };

  const handleCreateRide = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const rideData = {
        source: newRide.source,
        destination: newRide.destination,
        travelDate: newRide.date, // Format is already yyyy-MM-dd from input type="date"
        travelTime: newRide.time + ":00", // Append seconds
        pricePerSeat: parseFloat(newRide.pricePerSeat),
        availableSeats: parseInt(newRide.availableSeats),
        // vehicleModel removed as it's not in Ride entity
      };

      await postRide(rideData);

      toast({
        title: "Ride Posted!",
        description: "Your ride has been successfully created.",
      });

      setIsDialogOpen(false);
      loadRides();

      // Reset form
      setNewRide(prev => ({
        ...prev,
        source: "",
        destination: "",
        date: "",
        time: "",
        pricePerSeat: "",
      }));

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to post ride.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("rideconnect_current_user");
    navigate("/");
  };

  if (!user) return null;

  // Derived stats (adapt to what API returns)
  const activeRides = rides; // Assuming all returned by getMyRides are relevant
  const totalPassengers = 0; // API usually doesn't return full passenger list in summary, so we set 0 or remove stat.

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden hover:scale-110 transition-transform duration-300">
              <div className="w-full h-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
                RC
              </div>
            </div>
            <span className="font-display font-bold text-xl">RideConnect</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link to="/profile">
              <Button variant="outline" size="sm" className="rounded-full hidden md:flex">
                Profile
              </Button>
            </Link>

            <span className="text-sm font-medium hidden md:inline-block">
              Driver: {user.name}
            </span>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You will be redirected to the home page.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSignOut}>Yes, Log Out</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Driver Dashboard</h1>
              <p className="text-muted-foreground">Manage your rides and passengers</p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Plus className="w-4 h-4 mr-2" />
                  Host New Ride
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Ride</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateRide} className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="from">From</Label>
                      <Input
                        id="from"
                        placeholder="e.g., Delhi"
                        value={newRide.source}
                        onChange={(e) => setNewRide({ ...newRide, source: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="to">To</Label>
                      <Input
                        id="to"
                        placeholder="e.g., Agra"
                        value={newRide.destination}
                        onChange={(e) => setNewRide({ ...newRide, destination: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={newRide.date}
                        onChange={(e) => setNewRide({ ...newRide, date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time">Time</Label>
                      <Input
                        id="time"
                        type="time"
                        value={newRide.time}
                        onChange={(e) => setNewRide({ ...newRide, time: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Vehicle Model Field - Required by API */}
                  <div className="space-y-2">
                    <Label htmlFor="vehicle">Vehicle Model</Label>
                    <Input
                      id="vehicle"
                      placeholder="e.g. Toyota Innova"
                      value={newRide.vehicleModel}
                      onChange={(e) => setNewRide({ ...newRide, vehicleModel: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="seats">Available Seats</Label>
                      <Input
                        id="seats"
                        type="number"
                        min="1"
                        max="10"
                        value={newRide.availableSeats}
                        onChange={(e) => setNewRide({ ...newRide, availableSeats: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (₹)</Label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        value={newRide.pricePerSeat}
                        onChange={(e) => setNewRide({ ...newRide, pricePerSeat: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "creating..." : "Create Ride"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats - Simplified as we might not have all data from simple API */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="glass-card p-6 rounded-xl">
              <div className="text-3xl font-bold text-primary">{activeRides.length}</div>
              <div className="text-muted-foreground">My Active Rides</div>
            </div>
            {/* 
            <div className="glass-card p-6 rounded-xl">
              <div className="text-3xl font-bold text-green-500">0</div>
              <div className="text-muted-foreground">Completed (coming soon)</div>
            </div> 
            */}
          </div>

          {/* Active Rides List */}
          <h2 className="text-xl font-semibold mb-4">Your Rides</h2>
          {rides.length === 0 ? (
            <div className="text-center py-12 glass-card rounded-2xl">
              <Car className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">You haven't posted any rides yet.</p>
              <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Ride
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rides.map((ride, index) => (
                <motion.div
                  key={ride.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card p-6 rounded-xl"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-500">
                      Active
                    </div>
                    <div className="text-xl font-bold text-accent">₹{ride.pricePerSeat}</div>
                  </div>

                  <div className="mb-4">
                    <h3 className="font-semibold text-lg">{ride.source}</h3>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span>→</span>
                      <span>{ride.destination}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{ride.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{ride.time}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{ride.availableSeats} seats left</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default DriverDashboard;
