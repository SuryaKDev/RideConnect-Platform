import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Car, User, Mail, Phone, Lock, Upload, Save, ArrowLeft, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser, updateUser, changePassword, signOut } from "@/lib/auth";

const Profile = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [user, setUser] = useState(getCurrentUser());
    const [isLoading, setIsLoading] = useState(false);
    const [isPasswordSectionOpen, setIsPasswordSectionOpen] = useState(false);
    const [profilePhotoPreview, setProfilePhotoPreview] = useState<string>("");

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        vehicleModel: "",
        licensePlate: "",
        vehicleCapacity: 4,
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    useEffect(() => {
        if (!user) {
            navigate('/signin');
            return;
        }
        setFormData({
            name: user.name,
            phone: user.phone,
            vehicleModel: user.vehicleModel || "",
            licensePlate: user.licensePlate || "",
            vehicleCapacity: user.vehicleCapacity || 4,
        });
        if (user.profilePhoto) {
            setProfilePhotoPreview(user.profilePhoto);
        }
    }, [user, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setProfilePhotoPreview(base64);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsLoading(true);

        const updates: any = {
            name: formData.name,
            phone: formData.phone,
            profilePhoto: profilePhotoPreview,
        };

        if (user.role === 'driver') {
            updates.vehicleModel = formData.vehicleModel;
            updates.licensePlate = formData.licensePlate;
            updates.vehicleCapacity = Number(formData.vehicleCapacity);
        }

        await updateUser(user.id, updates);
        setUser(getCurrentUser()); // Refresh user data

        toast({
            title: "Profile updated",
            description: "Your changes have been saved successfully.",
        });
        setIsLoading(false);
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast({
                title: "Error",
                description: "New passwords do not match",
                variant: "destructive",
            });
            return;
        }

        const result = await changePassword(user.id, passwordData.currentPassword, passwordData.newPassword);
        if (result.success) {
            toast({
                title: "Password changed",
                description: "Your password has been updated successfully.",
            });
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
            setIsPasswordSectionOpen(false);
        } else {
            toast({
                title: "Error",
                description: result.error,
                variant: "destructive",
            });
        }
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <Link to="/" className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl overflow-hidden hover:scale-110 transition-transform duration-300">
                                <img src="/logo.png" alt="RideConnect Logo" className="w-full h-full object-cover" />
                            </div>
                            <span className="font-display font-bold text-xl">RideConnect</span>
                        </Link>
                    </div>

                    <Button variant="ghost" size="sm" onClick={handleSignOut}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                    </Button>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-2xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-3xl font-bold mb-8">My Profile</h1>

                    <div className="glass-card p-8 rounded-2xl mb-8">
                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                            {/* Profile Photo */}
                            <div className="flex flex-col items-center mb-8">
                                <div className="relative w-32 h-32 rounded-full overflow-hidden bg-muted mb-4 border-4 border-background shadow-xl">
                                    {profilePhotoPreview ? (
                                        <img src={profilePhotoPreview} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-primary/10">
                                            <User className="w-12 h-12 text-primary" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                                        <Upload className="w-8 h-8 text-white" />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePhotoUpload}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground">Click image to update</p>
                            </div>

                            <div className="grid gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative">
                                        <Input
                                            id="email"
                                            value={user.email}
                                            disabled
                                            className="bg-muted"
                                        />
                                        <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    </div>
                                    <p className="text-xs text-muted-foreground">Email address cannot be changed</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                {user.role === 'driver' && (
                                    <>
                                        <div className="my-4 border-t border-border pt-4">
                                            <h3 className="text-lg font-semibold mb-4">Vehicle Details</h3>
                                            <div className="grid gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="vehicleModel">Vehicle Model</Label>
                                                    <Input
                                                        id="vehicleModel"
                                                        name="vehicleModel"
                                                        value={formData.vehicleModel}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="licensePlate">License Plate</Label>
                                                    <Input
                                                        id="licensePlate"
                                                        name="licensePlate"
                                                        value={formData.licensePlate}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="vehicleCapacity">Seating Capacity</Label>
                                                    <Input
                                                        id="vehicleCapacity"
                                                        name="vehicleCapacity"
                                                        type="number"
                                                        value={formData.vehicleCapacity}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                <Save className="w-4 h-4 mr-2" />
                                {isLoading ? "Saving Changes..." : "Save Changes"}
                            </Button>
                        </form>
                    </div>

                    {/* Change Password Section */}
                    <div className="glass-card p-8 rounded-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold">Security</h2>
                            <Button
                                variant="outline"
                                onClick={() => setIsPasswordSectionOpen(!isPasswordSectionOpen)}
                            >
                                {isPasswordSectionOpen ? "Cancel" : "Change Password"}
                            </Button>
                        </div>

                        {isPasswordSectionOpen && (
                            <form
                                onSubmit={handleChangePassword}
                                className="space-y-4 pt-4"
                            >
                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword">Current Password</Label>
                                    <Input
                                        id="currentPassword"
                                        name="currentPassword"
                                        type="password"
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">New Password</Label>
                                    <Input
                                        id="newPassword"
                                        name="newPassword"
                                        type="password"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        required
                                    />
                                </div>
                                <Button type="submit" variant="secondary" className="w-full">
                                    Update Password
                                </Button>
                            </form>
                        )}
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default Profile;
