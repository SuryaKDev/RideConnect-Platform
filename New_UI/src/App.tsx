import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import Register from "./pages/Register";
import PassengerDashboard from "./pages/PassengerDashboard";
import DriverDashboard from "./pages/DriverDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import PostRide from "./pages/PostRide";
import MyBookings from "./pages/MyBookings";
import TransactionHistory from "./pages/TransactionHistory";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/register" element={<Register />} />
          <Route path="/passenger-dashboard" element={<PassengerDashboard />} />
          <Route path="/driver-dashboard" element={<DriverDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/post-ride" element={<PostRide />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/transactions" element={<TransactionHistory />} />
          <Route path="/history" element={<TransactionHistory />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
