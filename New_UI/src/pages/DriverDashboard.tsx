import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Car, Plus, MapPin, Calendar, Clock, Users, LogOut, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser, signOut, getRides, createRide, Ride } from "@/lib/auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const DriverDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState(getCurrentUser());
  const [rides, setRides] = useState<Ride[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newRide, setNewRide] = useState({
    from: "",
    to: "",
    date: "",
    time: "",
    duration: "",
    seats: 4,
    price: 500,
  });

  useEffect(() => {
    if (!user || user.role !== 'driver') {
      navigate('/signin');
      return;
    }
    loadRides();
  }, [user, navigate]);

  const loadRides = () => {
    const myRides = getRides().filter(r => r.driverId === user?.id);
    setRides(myRides);
  };

  const handleCreateRide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    createRide({
      ...newRide,
      driverId: user.id,
      driverName: user.name,
      seats: Number(newRide.seats),
      price: Number(newRide.price),
    });

    toast({
      title: "Ride created!",
      description: "Your ride has been posted successfully.",
    });

    setNewRide({
      from: "",
      to: "",
      date: "",
      time: "",
      duration: "",
      seats: 4,
      price: 500,
    });
    setIsDialogOpen(false);
    loadRides();
  };

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  if (!user) return null;

  const activeRides = rides.filter(r => r.status === 'active');
  const completedRides = rides.filter(r => r.status === 'completed');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Car className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">RideConnect</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link to="/post-ride">
              <Button variant="default" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Post a Ride
              </Button>
            </Link>
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="w-5 h-5" />
              <span>{user.name}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
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
                <Button>
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
                        placeholder="e.g., Hyderabad"
                        value={newRide.from}
                        onChange={(e) => setNewRide({ ...newRide, from: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="to">To</Label>
                      <Input
                        id="to"
                        placeholder="e.g., Bangalore"
                        value={newRide.to}
                        onChange={(e) => setNewRide({ ...newRide, to: e.target.value })}
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

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      placeholder="e.g., 6h"
                      value={newRide.duration}
                      onChange={(e) => setNewRide({ ...newRide, duration: e.target.value })}
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
                        value={newRide.seats}
                        onChange={(e) => setNewRide({ ...newRide, seats: Number(e.target.value) })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (₹)</Label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        value={newRide.price}
                        onChange={(e) => setNewRide({ ...newRide, price: Number(e.target.value) })}
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full">
                    Create Ride
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="glass-card p-6 rounded-xl">
              <div className="text-3xl font-bold text-primary">{activeRides.length}</div>
              <div className="text-muted-foreground">Active Rides</div>
            </div>
            <div className="glass-card p-6 rounded-xl">
              <div className="text-3xl font-bold text-green-500">{completedRides.length}</div>
              <div className="text-muted-foreground">Completed Rides</div>
            </div>
            <div className="glass-card p-6 rounded-xl">
              <div className="text-3xl font-bold text-accent-foreground">
                {rides.reduce((sum, r) => sum + r.passengers.length, 0)}
              </div>
              <div className="text-muted-foreground">Total Passengers</div>
            </div>
          </div>

          {/* Vehicle Info */}
          {user.vehicleModel && (
            <div className="glass-card p-6 rounded-xl mb-8">
              <h2 className="text-xl font-semibold mb-4">Your Vehicle</h2>
              <div className="flex items-center gap-6">
                {user.vehiclePhoto && (
                  <img
                    src={user.vehiclePhoto}
                    alt="Vehicle"
                    className="w-32 h-24 object-cover rounded-lg"
                  />
                )}
                <div>
                  <div className="font-semibold">{user.vehicleModel}</div>
                  <div className="text-muted-foreground">{user.licensePlate}</div>
                  <div className="text-sm text-muted-foreground">Capacity: {user.vehicleCapacity} seats</div>
                </div>
              </div>
            </div>
          )}

          {/* Active Rides */}
          <h2 className="text-xl font-semibold mb-4">Your Rides</h2>
          {rides.length === 0 ? (
            <div className="text-center py-12 glass-card rounded-2xl">
              <Car className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">You haven't created any rides yet</p>
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
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      ride.status === 'active' 
                        ? 'bg-green-500/20 text-green-500' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {ride.status}
                    </div>
                    <div className="text-xl font-bold text-primary">₹{ride.price}</div>
                  </div>

                  <div className="mb-4">
                    <h3 className="font-semibold text-lg">{ride.from}</h3>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span>→</span>
                      <span>{ride.to}</span>
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
                      <span>{ride.passengers.length} / {ride.seats} passengers</span>
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
