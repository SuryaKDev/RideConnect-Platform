import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Car, Users, MapPin, LogOut, User, Shield, Ban, CheckCircle, 
  Trash2, BarChart3, TrendingUp, Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser, signOut, getUsers, getRides, updateUser, deleteUser, User as UserType, Ride } from "@/lib/auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState(getCurrentUser());
  const [users, setUsers] = useState<UserType[]>([]);
  const [rides, setRides] = useState<Ride[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'rides'>('overview');
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [blockReason, setBlockReason] = useState("");

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/signin');
      return;
    }
    loadData();
  }, [user, navigate]);

  const loadData = () => {
    setUsers(getUsers().filter(u => u.role !== 'admin'));
    setRides(getRides());
  };

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  const handleVerifyUser = (userId: string) => {
    updateUser(userId, { isVerified: true });
    toast({ title: "User verified successfully" });
    loadData();
  };

  const handleBlockUser = () => {
    if (!selectedUser || !blockReason.trim()) return;
    
    updateUser(selectedUser.id, { isBlocked: true, blockReason });
    toast({ title: "User blocked", description: blockReason });
    setBlockDialogOpen(false);
    setBlockReason("");
    setSelectedUser(null);
    loadData();
  };

  const handleUnblockUser = (userId: string) => {
    updateUser(userId, { isBlocked: false, blockReason: undefined });
    toast({ title: "User unblocked" });
    loadData();
  };

  const handleDeleteUser = (userId: string) => {
    deleteUser(userId);
    toast({ title: "User deleted" });
    loadData();
  };

  const openBlockDialog = (user: UserType) => {
    setSelectedUser(user);
    setBlockDialogOpen(true);
  };

  if (!user) return null;

  const passengers = users.filter(u => u.role === 'passenger');
  const drivers = users.filter(u => u.role === 'driver');
  const activeRides = rides.filter(r => r.status === 'active');

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
            <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full font-medium">Admin</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="w-5 h-5" />
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
          <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

          {/* Tabs */}
          <div className="flex gap-2 mb-8">
            {['overview', 'users', 'rides'].map((tab) => (
              <Button
                key={tab}
                variant={activeTab === tab ? 'default' : 'outline'}
                onClick={() => setActiveTab(tab as typeof activeTab)}
                className="capitalize"
              >
                {tab}
              </Button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid md:grid-cols-4 gap-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-card p-6 rounded-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold">{users.length}</div>
                      <div className="text-muted-foreground text-sm">Total Users</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="glass-card p-6 rounded-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold">{passengers.length}</div>
                      <div className="text-muted-foreground text-sm">Passengers</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="glass-card p-6 rounded-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Car className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold">{drivers.length}</div>
                      <div className="text-muted-foreground text-sm">Drivers</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="glass-card p-6 rounded-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-accent-foreground" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold">{activeRides.length}</div>
                      <div className="text-muted-foreground text-sm">Active Rides</div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Charts Placeholder */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="glass-card p-6 rounded-xl">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    User Growth
                  </h3>
                  <div className="h-48 flex items-center justify-center bg-muted/30 rounded-lg">
                    <div className="text-center text-muted-foreground">
                      <TrendingUp className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-sm">Chart visualization</p>
                      <p className="text-xs">(Connect backend for real data)</p>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-6 rounded-xl">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Ride Activity
                  </h3>
                  <div className="h-48 flex items-center justify-center bg-muted/30 rounded-lg">
                    <div className="text-center text-muted-foreground">
                      <Activity className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-sm">Activity chart</p>
                      <p className="text-xs">(Connect backend for real data)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="glass-card rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No users registered yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.name}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>{u.phone}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            u.role === 'driver' 
                              ? 'bg-green-500/20 text-green-500' 
                              : 'bg-blue-500/20 text-blue-500'
                          }`}>
                            {u.role}
                          </span>
                        </TableCell>
                        <TableCell>
                          {u.isBlocked ? (
                            <div>
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-500">
                                Blocked
                              </span>
                              {u.blockReason && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Reason: {u.blockReason}
                                </p>
                              )}
                            </div>
                          ) : u.isVerified ? (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-500">
                              Verified
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-500">
                              Pending
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {!u.isVerified && !u.isBlocked && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleVerifyUser(u.id)}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            )}
                            {u.isBlocked ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUnblockUser(u.id)}
                              >
                                Unblock
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openBlockDialog(u)}
                              >
                                <Ban className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteUser(u.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Rides Tab */}
          {activeTab === 'rides' && (
            <div className="glass-card rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Route</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Seats</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rides.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No rides posted yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    rides.map((ride) => (
                      <TableRow key={ride.id}>
                        <TableCell className="font-medium">
                          {ride.from} → {ride.to}
                        </TableCell>
                        <TableCell>{ride.driverName}</TableCell>
                        <TableCell>
                          {ride.date} at {ride.time}
                        </TableCell>
                        <TableCell>
                          {ride.passengers.length} / {ride.seats}
                        </TableCell>
                        <TableCell>₹{ride.price}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            ride.status === 'active' 
                              ? 'bg-green-500/20 text-green-500' 
                              : ride.status === 'completed'
                              ? 'bg-blue-500/20 text-blue-500'
                              : 'bg-red-500/20 text-red-500'
                          }`}>
                            {ride.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </motion.div>
      </main>

      {/* Block User Dialog */}
      <Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Block User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-muted-foreground">
              You are about to block <strong>{selectedUser?.name}</strong>. 
              Please provide a reason:
            </p>
            <div className="space-y-2">
              <Label htmlFor="blockReason">Reason for blocking</Label>
              <Input
                id="blockReason"
                placeholder="Enter reason..."
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setBlockDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleBlockUser}
                disabled={!blockReason.trim()}
              >
                Block User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
