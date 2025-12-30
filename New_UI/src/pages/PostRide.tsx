import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { CalendarIcon, Car, MapPin, Clock, DollarSign, Users, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { postRide } from "@/lib/api";
import { cn } from "@/lib/utils";

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
        date: format(date, "yyyy-MM-dd"),
        time: formData.time,
        pricePerSeat: parseFloat(formData.pricePerSeat),
        availableSeats: parseInt(formData.availableSeats),
        vehicleModel: formData.vehicleModel,
      };

      await postRide(rideData);
      
      toast({
        title: "Ride Posted Successfully!",
        description: "Your ride has been published and is now visible to passengers.",
      });
      
      navigate("/driver-dashboard");
    } catch (error: any) {
      toast({
        title: "Failed to Post Ride",
        description: error.response?.data?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/driver-dashboard")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Car className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-xl font-bold">Post a New Ride</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl gradient-text">Publish Your Ride</CardTitle>
            <CardDescription>
              Fill in the details below to offer a ride to passengers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Route Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Route Details
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="source">Source Location</Label>
                    <Input
                      id="source"
                      name="source"
                      placeholder="e.g., Mumbai"
                      value={formData.source}
                      onChange={handleInputChange}
                      required
                      className="bg-secondary/50 border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="destination">Destination</Label>
                    <Input
                      id="destination"
                      name="destination"
                      placeholder="e.g., Pune"
                      value={formData.destination}
                      onChange={handleInputChange}
                      required
                      className="bg-secondary/50 border-border"
                    />
                  </div>
                </div>
              </div>

              {/* Date & Time Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Schedule
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal bg-secondary/50 border-border",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      name="time"
                      type="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      required
                      className="bg-secondary/50 border-border"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing & Seats Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Pricing & Capacity
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="pricePerSeat">Price per Seat (₹)</Label>
                    <Input
                      id="pricePerSeat"
                      name="pricePerSeat"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="e.g., 500"
                      value={formData.pricePerSeat}
                      onChange={handleInputChange}
                      required
                      className="bg-secondary/50 border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="availableSeats">Available Seats</Label>
                    <Input
                      id="availableSeats"
                      name="availableSeats"
                      type="number"
                      min="1"
                      max="10"
                      placeholder="e.g., 3"
                      value={formData.availableSeats}
                      onChange={handleInputChange}
                      required
                      className="bg-secondary/50 border-border"
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Vehicle Information
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="vehicleModel">Vehicle Model</Label>
                  <Input
                    id="vehicleModel"
                    name="vehicleModel"
                    placeholder="e.g., Honda City"
                    value={formData.vehicleModel}
                    onChange={handleInputChange}
                    required
                    className="bg-secondary/50 border-border"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-lg glow-primary"
                disabled={isLoading}
              >
                {isLoading ? "Posting Ride..." : "Publish Ride"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PostRide;
