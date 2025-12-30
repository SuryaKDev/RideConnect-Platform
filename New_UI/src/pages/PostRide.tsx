import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Car, MapPin, Calendar, Clock, DollarSign, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// Removed Card import, we will use div with glass-card class or keep Card if we style it
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { postRide } from "@/lib/api";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const PostRide = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<Date>();
  const [formData, setFormData] = useState({
    source: "",
    destination: "",
    time: "",
    pricePerSeat: "",
    availableSeats: "",
    vehicleModel: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date) {
      toast({
        title: "Date Required",
        description: "Please select a date for your ride.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const rideData = {
        source: formData.source,
        destination: formData.destination,
        travelDate: format(date, "yyyy-MM-dd"),
        // Backend expects LocalTime (HH:mm:ss), input gives HH:mm
        travelTime: formData.time + ":00",
        pricePerSeat: parseFloat(formData.pricePerSeat),
        availableSeats: parseInt(formData.availableSeats),
        // vehicleModel is part of Driver (User), not Ride entity, so we don't send it here
      };

      await postRide(rideData);

      toast({
        title: "Ride Posted Successfully!",
        description: "Your ride has been published.",
      });

      navigate("/driver-dashboard");
    } catch (error: any) {
      toast({
        title: "Error Posting Ride",
        description: error.response?.data?.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Reuse Header structure from Dashboard (Simplified for subtype pages) */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <span className="font-display font-bold text-xl">RideConnect</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/driver-dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
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

          <div className="glass-card p-8 rounded-2xl">
            <div className="mb-8">
              <h1 className="text-2xl font-bold flex items-center gap-2 mb-2">
                <Car className="w-6 h-6 text-primary" />
                Post a New Ride
              </h1>
              <p className="text-muted-foreground">
                Fill in the details below to publish your ride.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Route Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground/90">
                  <MapPin className="w-5 h-5 text-accent" />
                  Route Details
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="source">Pickup Location</Label>
                    <Input
                      id="source"
                      name="source"
                      placeholder="e.g. Mumbai"
                      value={formData.source}
                      onChange={handleInputChange}
                      required
                      className="bg-background/50 border-input/50 focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="destination">Drop-off Location</Label>
                    <Input
                      id="destination"
                      name="destination"
                      placeholder="e.g. Pune"
                      value={formData.destination}
                      onChange={handleInputChange}
                      required
                      className="bg-background/50 border-input/50 focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground/90">
                  <Calendar className="w-5 h-5 text-accent" />
                  Schedule
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2 flex flex-col">
                    <Label className="mb-2">Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal bg-background/50 border-input/50",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-card border-border">
                        <CalendarComponent
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className="bg-card text-foreground"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Departure Time</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="time"
                        name="time"
                        type="time"
                        className="pl-9 bg-background/50 border-input/50"
                        value={formData.time}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing & Capacity */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground/90">
                  <DollarSign className="w-5 h-5 text-accent" />
                  Pricing & Capacity
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pricePerSeat">Price per Seat (₹)</Label>
                    <Input
                      id="pricePerSeat"
                      name="pricePerSeat"
                      type="number"
                      min="0"
                      placeholder="e.g. 500"
                      value={formData.pricePerSeat}
                      onChange={handleInputChange}
                      required
                      className="bg-background/50 border-input/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="availableSeats">Available Seats</Label>
                    <Input
                      id="availableSeats"
                      name="availableSeats"
                      type="number"
                      min="1"
                      max="6"
                      value={formData.availableSeats}
                      onChange={handleInputChange}
                      required
                      className="bg-background/50 border-input/50"
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground/90">
                  <Users className="w-5 h-5 text-accent" />
                  Vehicle Information
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="vehicleModel">Vehicle Model</Label>
                  <Input
                    id="vehicleModel"
                    name="vehicleModel"
                    placeholder="e.g. Maruti Swift"
                    value={formData.vehicleModel}
                    onChange={handleInputChange}
                    required
                    className="bg-background/50 border-input/50"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" size="lg" disabled={isLoading}>
                {isLoading ? "Publishing Ride..." : "Publish Ride"}
              </Button>
            </form>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default PostRide;
