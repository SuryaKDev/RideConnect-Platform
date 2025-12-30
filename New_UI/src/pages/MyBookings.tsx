import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, User, Clock, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { getMyBookings, cancelBooking } from "@/lib/api";

interface Booking {
  id: number;
  driverName: string;
  source: string;
  destination: string;
  date: string;
  time: string;
  status: "CONFIRMED" | "CANCELLED" | "PENDING" | "COMPLETED";
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
        title: "Failed to Load Bookings",
        description: error.response?.data?.message || "Please try again later.",
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
        description: "Your booking has been successfully cancelled.",
      });
      // Update local state
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === id ? { ...booking, status: "CANCELLED" as const } : booking
        )
      );
    } catch (error: any) {
      toast({
        title: "Failed to Cancel",
        description: error.response?.data?.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status: Booking["status"]) => {
    switch (status) {
      case "CONFIRMED":
        return (
          <Badge className="bg-primary/20 text-primary border-primary/30">
            <CheckCircle className="h-3 w-3 mr-1" />
            Confirmed
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge variant="destructive" className="bg-destructive/20 text-destructive border-destructive/30">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-accent/20 text-accent border-accent/30">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge className="bg-muted text-muted-foreground border-border">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const isActiveBooking = (status: Booking["status"]) => {
    return status === "CONFIRMED" || status === "PENDING";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/passenger-dashboard")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-xl font-bold">My Bookings</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="glass-card">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <Card className="glass-card max-w-md mx-auto text-center">
            <CardContent className="py-12">
              <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Bookings Yet</h3>
              <p className="text-muted-foreground mb-6">
                You haven't booked any rides yet. Start exploring available rides!
              </p>
              <Button
                onClick={() => navigate("/passenger-dashboard")}
                className="bg-primary hover:bg-primary/90"
              >
                Find Rides
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {bookings.map((booking) => (
              <Card
                key={booking.id}
                className="glass-card border-border/50 hover:border-primary/30 transition-colors"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        {booking.source} → {booking.destination}
                      </CardTitle>
                      <CardDescription className="mt-1 flex items-center gap-2">
                        <User className="h-3 w-3" />
                        Driver: {booking.driverName}
                      </CardDescription>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{booking.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{booking.time}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Price</p>
                      <p className="text-xl font-bold text-primary">
                        ₹{booking.price.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Seats</p>
                      <p className="text-lg font-semibold">{booking.seats}</p>
                    </div>
                  </div>

                  {isActiveBooking(booking.status) && (
                    <Button
                      variant="destructive"
                      className="w-full bg-destructive/20 text-destructive hover:bg-destructive/30 border border-destructive/30"
                      onClick={() => handleCancelBooking(booking.id)}
                      disabled={cancellingId === booking.id}
                    >
                      {cancellingId === booking.id ? "Cancelling..." : "Cancel Booking"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyBookings;
