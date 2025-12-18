import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Car, Search, MapPin, Calendar, Clock, Users, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser, signOut, getRides, bookRide, Ride } from "@/lib/auth";
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

const PassengerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState(getCurrentUser());
  const [rides, setRides] = useState<Ride[]>([]);
  const [searchFrom, setSearchFrom] = useState("");
  const [searchTo, setSearchTo] = useState("");
  const [filteredRides, setFilteredRides] = useState<Ride[]>([]);

  useEffect(() => {
    if (!user || user.role !== 'passenger') {
      navigate('/signin');
      return;
    }
    loadRides();
  }, [user, navigate]);

  const loadRides = async () => {
    const ridesData = await getRides();
    const allRides = ridesData.filter(r => r.status === 'active' && r.availableSeats > 0);
    setRides(allRides);
    setFilteredRides(allRides);
  };

  const handleSearch = () => {
    const filtered = rides.filter(ride => {
      const fromMatch = !searchFrom || ride.from.toLowerCase().includes(searchFrom.toLowerCase());
      const toMatch = !searchTo || ride.to.toLowerCase().includes(searchTo.toLowerCase());
      return fromMatch && toMatch;
    });
    setFilteredRides(filtered);
  };

  const handleBookRide = async (rideId: string) => {
    if (!user) return;

    const result = await bookRide(rideId, user.id);
    if (result.success) {
      toast({
        title: "Ride booked!",
        description: "Your ride has been successfully booked.",
      });
      loadRides();
    } else {
      toast({
        title: "Booking failed",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const myBookings = rides.filter(r => r.passengers.includes(user?.id || ''));

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden hover:scale-110 transition-transform duration-300">
              <img src="/logo.png" alt="RideConnect Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-display font-bold text-xl">RideConnect</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link to="/profile">
              <Button variant="outline" size="sm" className="rounded-full">
                Profile
              </Button>
            </Link>

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
          <h1 className="text-3xl font-bold mb-2">Find a Ride</h1>
          <p className="text-muted-foreground mb-8">Search for available rides to your destination</p>

          {/* Search Section */}
          <div className="glass-card p-6 rounded-2xl mb-8">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="From (e.g., Hyderabad)"
                  value={searchFrom}
                  onChange={(e) => setSearchFrom(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-accent" />
                <Input
                  placeholder="To (e.g., Bangalore)"
                  value={searchTo}
                  onChange={(e) => setSearchTo(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                <Search className="w-4 h-4 mr-2" />
                Search Rides
              </Button>
            </div>
          </div>

          {/* My Bookings */}
          {myBookings.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">My Bookings</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myBookings.map((ride) => (
                  <motion.div
                    key={ride.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card p-4 rounded-xl border-2 border-primary/30"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-sm text-green-500 font-medium">Booked</span>
                    </div>
                    <div className="font-semibold">{ride.from} → {ride.to}</div>
                    <div className="text-sm text-muted-foreground mt-2 flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {ride.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {ride.time}
                      </span>
                    </div>
                    <div className="mt-2 text-primary font-bold">₹{ride.price}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Available Rides */}
          <h2 className="text-xl font-semibold mb-4">Available Rides</h2>
          {filteredRides.length === 0 ? (
            <div className="text-center py-12 glass-card rounded-2xl">
              <Car className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No rides available at the moment</p>
              <p className="text-sm text-muted-foreground mt-2">Check back later or try different search criteria</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRides.map((ride, index) => (
                <motion.div
                  key={ride.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card p-6 rounded-xl hover:border-primary/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{ride.from}</h3>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span>→</span>
                        <span>{ride.to}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-accent">₹{ride.price}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{ride.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{ride.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{ride.availableSeats} seats</span>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground mb-4">
                    Driver: {ride.driverName}
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => handleBookRide(ride.id)}
                    disabled={ride.passengers.includes(user.id)}
                  >
                    {ride.passengers.includes(user.id) ? 'Already Booked' : 'Book This Ride'}
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default PassengerDashboard;
