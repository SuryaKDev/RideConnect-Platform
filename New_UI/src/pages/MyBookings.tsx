import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, Clock, User, Ban, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getMyBookings, cancelBooking } from "@/lib/api";
import { motion } from "framer-motion";

interface Booking {
  id: number;
  driverName: string;
  source: string;
  destination: string;
  date: string;
  time: string;
  status: string;
  price: number;
  seats: number;
}

const MyBookings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const data = await getMyBookings();
      setBookings(data);
    } catch (error: any) {
      toast({
        title: "Error Loading Bookings",
        description: error.response?.data?.message || "Could not fetch your bookings.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async (id: number) => {
    setCancellingId(id);
    try {
      await cancelBooking(id);
      toast({
        title: "Booking Cancelled",
        description: "Your booking has been cancelled successfully.",
      });
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "CANCELLED" } : b))
      );
    } catch (error: any) {
      toast({
        title: "Cancellation Failed",
        description: error.response?.data?.message || "Could not cancel your booking.",
        variant: "destructive",
      });
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return (
          <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30 border-none">
            <CheckCircle className="w-3 h-3 mr-1" /> Confirmed
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge variant="destructive" className="bg-red-500/20 text-red-500 hover:bg-red-500/30 border-none">
            <Ban className="w-3 h-3 mr-1" /> Cancelled
          </Badge>
        );
      case "PENDING":
        return (
          <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30 border-none">
            <Clock className="w-3 h-3 mr-1" /> Pending
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const isActiveBooking = (status: string) => {
    return status === "CONFIRMED" || status === "PENDING";
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <span className="font-display font-bold text-xl">RideConnect</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/passenger-dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6 text-muted-foreground hover:text-foreground pl-0 hover:bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">My Bookings</h1>
              <p className="text-muted-foreground">
                View and manage all your ride bookings
              </p>
            </div>
          </div>

          <div className="grid gap-6">
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="glass-card h-48 animate-pulse p-6 rounded-xl">
                    <div className="h-6 w-3/4 bg-muted/50 rounded mb-4"></div>
                    <div className="h-4 w-1/2 bg-muted/30 rounded"></div>
                  </div>
                ))}
              </div>
            ) : bookings.length === 0 ? (
              <div className="glass-card text-center py-12 rounded-xl">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Bookings Yet</h3>
                <p className="text-muted-foreground mb-6">
                  You haven't booked any rides yet. Start exploring available rides!
                </p>
                <Button onClick={() => navigate("/passenger-dashboard")}>
                  Find Rides
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookings.map((booking, index) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-card hover:border-primary/50 transition-all rounded-xl p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        {booking.source} → {booking.destination}
                      </h3>
                    </div>
                    <div className="mb-4">
                      {getStatusBadge(booking.status)}
                    </div>

                    <div className="space-y-4 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="w-4 h-4" />
                        <span>Driver: {booking.driverName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{booking.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{booking.time}</span>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-border flex items-center justify-between">
                        <div>
                          <span className="text-lg font-bold text-accent">₹{booking.price}</span>
                          <span className="text-muted-foreground ml-1 text-xs">
                            ({booking.seats} seats)
                          </span>
                        </div>
                        {isActiveBooking(booking.status) && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleCancelBooking(booking.id)}
                            disabled={cancellingId === booking.id}
                          >
                            {cancellingId === booking.id ? "..." : "Cancel"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MyBookings;
