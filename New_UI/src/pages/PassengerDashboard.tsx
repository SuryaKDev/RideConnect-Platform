import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Car, Search, MapPin, Calendar, Clock, Users, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { searchRides, bookRide as apiBookRide } from "@/lib/api";

interface Ride {
  id: number;
  source: string;
  destination: string;
  date: string;
  time: string;
  duration?: string;
  pricePerSeat: number;
  availableSeats: number;
  driverName: string;
  vehicleModel?: string;
}

interface CurrentUser {
  id: number;
  name: string;
  email: string;
  role: string;
  token: string;
}

const PassengerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [rides, setRides] = useState<Ride[]>([]);
  const [searchFrom, setSearchFrom] = useState("");
  const [searchTo, setSearchTo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isBooking, setIsBooking] = useState<number | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('rideconnect_current_user');
    if (!userData) {
      navigate('/signin');
      return;
    }
    try {
      const parsed = JSON.parse(userData);
      if (parsed.role !== 'PASSENGER') {
        navigate('/signin');
        return;
      }
      setUser(parsed);
    } catch {
      navigate('/signin');
    }
  }, [navigate]);

  const handleSearch = async () => {
    if (!searchFrom || !searchTo) {
      toast({
        title: "Please enter locations",
        description: "Both source and destination are required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const results = await searchRides({ source: searchFrom, destination: searchTo });
      setRides(results);
    } catch (error: any) {
      toast({
        title: "Search failed",
        description: error.response?.data?.message || "Could not fetch rides",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookRide = async (rideId: number) => {
    setIsBooking(rideId);
    try {
      await apiBookRide(rideId, 1);
      toast({
        title: "Ride booked!",
        description: "Your ride has been successfully booked.",
      });
      // Refresh search results
      if (searchFrom && searchTo) {
        const results = await searchRides({ source: searchFrom, destination: searchTo });
        setRides(results);
      }
    } catch (error: any) {
      toast({
        title: "Booking failed",
        description: error.response?.data?.message || "Could not book ride",
        variant: "destructive",
      });
    } finally {
      setIsBooking(null);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('rideconnect_current_user');
    navigate('/');
  };

  if (!user) return null;

  // Note: My Bookings section removed - use /my-bookings page instead

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
            <Link to="/my-bookings">
              <Button variant="outline" size="sm">
                My Bookings
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
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                <Input
                  placeholder="To (e.g., Bangalore)"
                  value={searchTo}
                  onChange={(e) => setSearchTo(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch} className="w-full" disabled={isLoading}>
                <Search className="w-4 h-4 mr-2" />
                {isLoading ? "Searching..." : "Search Rides"}
              </Button>
            </div>
          </div>


          {/* Search Results */}
          <h2 className="text-xl font-semibold mb-4">Available Rides</h2>
          {rides.length === 0 ? (
            <div className="text-center py-12 glass-card rounded-2xl">
              <Car className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No rides found</p>
              <p className="text-sm text-muted-foreground mt-2">Enter source and destination to search for rides</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rides.map((ride, index) => (
                <motion.div
                  key={ride.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card p-6 rounded-xl hover:border-primary/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{ride.source}</h3>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span>→</span>
                        <span>{ride.destination}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">₹{ride.pricePerSeat}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{ride.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{ride.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{ride.availableSeats} seats</span>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground mb-4">
                    Driver: {ride.driverName} {ride.vehicleModel && `• ${ride.vehicleModel}`}
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={() => handleBookRide(ride.id)}
                    disabled={isBooking === ride.id}
                  >
                    {isBooking === ride.id ? 'Booking...' : 'Book This Ride'}
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
