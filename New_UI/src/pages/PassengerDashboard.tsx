import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Car, Search, MapPin, Calendar, Clock, Users, LogOut, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { searchRides, bookRide, getMyBookings, RideFilters } from "@/lib/api";
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

// Interface matches the API response
interface Ride {
  id: number;
  source: string;
  destination: string;
  date: string;
  time: string;
  pricePerSeat: number; // Changed from price to pricePerSeat to match API
  availableSeats: number;
  driverName: string;
}

interface Booking {
  id: number;
  source: string;
  destination: string;
  date: string;
  time: string;
  price: number;
  status: string;
}

const PassengerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [rides, setRides] = useState<Ride[]>([]); // Search results
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [searchFrom, setSearchFrom] = useState("");
  const [searchTo, setSearchTo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Auth & Initial Data Load
  useEffect(() => {
    const userDataString = localStorage.getItem("rideconnect_current_user");
    if (!userDataString) {
      navigate("/signin");
      return;
    }

    try {
      const userData = JSON.parse(userDataString);
      setUser(userData); // Assuming userData has name/email
      loadBookings();
    } catch (e) {
      console.error("Failed to parse user data", e);
      navigate("/signin");
    }
  }, [navigate]);

  const loadBookings = async () => {
    setLoadingBookings(true);
    try {
      const data = await getMyBookings();
      setMyBookings(data);
    } catch (error) {
      console.error("Failed to load bookings", error);
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleSearch = async () => {
    if (!searchFrom && !searchTo) {
      toast({
        title: "Enter a location",
        description: "Please enter at least a source or destination.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const filters: RideFilters = {
        source: searchFrom,
        destination: searchTo,
      };
      const results = await searchRides(filters);
      setRides(results);

      if (results.length === 0) {
        toast({
          title: "No rides found",
          description: "Try adjusting your search criteria.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Search Failed",
        description: error.response?.data?.message || "Could not search rides.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookRide = async (rideId: number) => {
    try {
      await bookRide(rideId, 1); // Default to 1 seat for now
      toast({
        title: "Ride booked!",
        description: "Your ride has been successfully booked.",
      });
      loadBookings(); // Refresh bookings list
      // Optionally remove from search results or mark as booked
      setRides(prev => prev.filter(r => r.id !== rideId));
    } catch (error: any) {
      toast({
        title: "Booking failed",
        description: error.response?.data?.message || "Could not book ride.",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("rideconnect_current_user");
    navigate("/");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden hover:scale-110 transition-transform duration-300">
              {/* Using the CSS class from Surya's design but ensuring fallback if img missing */}
              <div className="w-full h-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
                RC
              </div>
            </div>
            <span className="font-display font-bold text-xl">RideConnect</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link to="/my-bookings">
              <Button variant="outline" size="sm" className="rounded-full hidden md:flex">
                My Bookings Full View
              </Button>
            </Link>

            <span className="text-sm font-medium hidden md:inline-block">
              Hello, {user.name}
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
          <h1 className="text-3xl font-bold mb-2">Find a Ride</h1>
          <p className="text-muted-foreground mb-8">Search for available rides to your destination</p>

          {/* Search Section - Surya's UI Structure */}
          <div className="glass-card p-6 rounded-2xl mb-8">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="From (e.g., Delhi)"
                  value={searchFrom}
                  onChange={(e) => setSearchFrom(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-accent" />
                <Input
                  placeholder="To (e.g., Mumbai)"
                  value={searchTo}
                  onChange={(e) => setSearchTo(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading}>
                <Search className="w-4 h-4 mr-2" />
                {isLoading ? "Searching..." : "Search Rides"}
              </Button>
            </div>
          </div>

          {/* My Bookings Preview - Surya's UI Structure */}
          {myBookings.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">My Upcoming Bookings</h2>
                <Link to="/my-bookings" className="text-primary hover:underline text-sm">View All</Link>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myBookings.slice(0, 3).map((ride) => (
                  <motion.div
                    key={ride.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card p-4 rounded-xl border-2 border-primary/30"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-sm text-green-500 font-medium">{ride.status}</span>
                    </div>
                    <div className="font-semibold">{ride.source} → {ride.destination}</div>
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

          {/* Available Rides - Surya's UI Structure */}
          <h2 className="text-xl font-semibold mb-4">Available Rides</h2>
          {rides.length === 0 ? (
            <div className="text-center py-12 glass-card rounded-2xl">
              <Car className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No rides found matching your criteria</p>
              <p className="text-sm text-muted-foreground mt-2">Try searching for a different route</p>
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
                      <div className="text-2xl font-bold text-accent">₹{ride.pricePerSeat}</div>
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
                    Driver: {ride.driverName}
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => handleBookRide(ride.id)}
                  >
                    Book This Ride
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
