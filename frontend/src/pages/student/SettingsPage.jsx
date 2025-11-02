import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { getUser, setUser } from '@/utils/storage';
import { userAPI } from '@/utils/api';
import { useTheme } from '@/contexts/ThemeContext';
import { User, Bell, Shield, Palette, Upload, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function SettingsPage() {
    const user = getUser();
    const { theme, toggleTheme } = useTheme();
    const fileInputRef = useRef(null);
    const [profile, setProfile] = useState({
        fullName: user?.fullName || '',
        email: user?.email || '',
        contact: user?.contact || '',
    });
    const [avatar, setAvatar] = useState(user?.avatar || '');
    const [notifications, setNotifications] = useState({
        assignments: true,
        announcements: true,
        grades: true,
        events: true,
    });
    const [password, setPassword] = useState({
        current: '',
        new: '',
        confirm: '',
    });

    const handleProfileUpdate = async () => {
        try {
            const response = await userAPI.updateProfile(profile);
            
            if (response.success) {
                // Update local storage with new user data
                const updatedUser = { ...user, ...response.user };
                setUser(updatedUser);
                toast.success(response.message || 'Profile updated successfully');
                // Force page reload to reflect changes on home page
                setTimeout(() => window.location.reload(), 500);
            }
        } catch (error) {
            console.error('Profile update error:', error);
            toast.error(error.message || 'Failed to update profile');
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (2MB limit)
            if (file.size > 2 * 1024 * 1024) {
                toast.error('File size exceeds 2MB limit');
                return;
            }
            
            // Check file type
            if (!file.type.match('image.*')) {
                toast.error('Please upload an image file (JPG, PNG, GIF)');
                return;
            }
            
            const reader = new FileReader();
            reader.onloadend = async () => {
                const avatarDataUrl = reader.result;
                try {
                    const response = await userAPI.updateAvatar(avatarDataUrl);
                    
                    if (response.success) {
                        setAvatar(response.avatar || avatarDataUrl);
                        const updatedUser = { ...user, avatar: response.avatar || avatarDataUrl };
                        setUser(updatedUser);
                        toast.success(response.message || 'Profile picture updated');
                    }
                } catch (error) {
                    console.error('Avatar update error:', error);
                    toast.error(error.message || 'Failed to update avatar');
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    const handleRemoveAvatar = async () => {
        try {
            const response = await userAPI.deleteAvatar();
            
            if (response.success) {
                setAvatar(null);
                const updatedUser = { ...user, avatar: null };
                setUser(updatedUser);
                toast.success(response.message || 'Profile picture removed');
            }
        } catch (error) {
            console.error('Avatar delete error:', error);
            toast.error(error.message || 'Failed to remove avatar');
        }
    };

    const handlePasswordChange = async () => {
        if (!password.current || !password.new || !password.confirm) {
            toast.error('Please fill in all password fields');
            return;
        }
        if (password.new !== password.confirm) {
            toast.error('New passwords do not match');
            return;
        }
        if (password.new.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        
        try {
            const response = await userAPI.changePassword(password.current, password.new);
            
            if (response.success) {
                setPassword({ current: '', new: '', confirm: '' });
                toast.success(response.message || 'Password changed successfully');
            }
        } catch (error) {
            console.error('Password change error:', error);
            toast.error(error.message || 'Failed to change password');
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
            </div>

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-4 max-w-2xl">
                    <TabsTrigger value="profile">
                        <User className="h-4 w-4 mr-2" />
                        Profile
                    </TabsTrigger>
                    <TabsTrigger value="notifications">
                        <Bell className="h-4 w-4 mr-2" />
                        Notifications
                    </TabsTrigger>
                    <TabsTrigger value="security">
                        <Shield className="h-4 w-4 mr-2" />
                        Security
                    </TabsTrigger>
                    <TabsTrigger value="appearance">
                        <Palette className="h-4 w-4 mr-2" />
                        Appearance
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile Information</CardTitle>
                                <CardDescription>Update your personal details</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Avatar */}
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-24 w-24">
                                        <AvatarImage src={avatar} />
                                        <AvatarFallback>{user?.fullName?.charAt(0) || 'U'}</AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-2">
                                        <Button variant="outline" onClick={triggerFileInput}>
                                            <Upload className="h-4 w-4 mr-2" />
                                            Change Profile
                                        </Button>
                                        <Input
                                            ref={fileInputRef}
                                            id="avatar-upload"
                                            type="file"
                                            accept="image/jpeg,image/png,image/gif"
                                            className="hidden"
                                            onChange={handleAvatarChange}
                                        />
                                        <Button variant="ghost" onClick={handleRemoveAvatar}>
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Remove Picture
                                        </Button>
                                    </div>
                                </div>

                                {/* Form */}
                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input
                                            id="name"
                                            value={profile.fullName}
                                            onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={profile.email}
                                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="contact">Contact Number</Label>
                                        <Input
                                            id="contact"
                                            value={profile.contact}
                                            onChange={(e) => setProfile({ ...profile, contact: e.target.value })}
                                            placeholder="+1 234 567 8900"
                                        />
                                    </div>
                                </div>

                                <Button onClick={handleProfileUpdate}>Save Changes</Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                </TabsContent>

                <TabsContent value="notifications">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Notification Preferences</CardTitle>
                                <CardDescription>Manage how you receive updates</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Assignment Notifications</p>
                                        <p className="text-sm text-muted-foreground">Get notified about new assignments</p>
                                    </div>
                                    <Switch
                                        checked={notifications.assignments}
                                        onCheckedChange={(checked) => setNotifications({ ...notifications, assignments: checked })}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Announcement Notifications</p>
                                        <p className="text-sm text-muted-foreground">Receive course announcements</p>
                                    </div>
                                    <Switch
                                        checked={notifications.announcements}
                                        onCheckedChange={(checked) => setNotifications({ ...notifications, announcements: checked })}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Grade Updates</p>
                                        <p className="text-sm text-muted-foreground">Get notified when grades are posted</p>
                                    </div>
                                    <Switch
                                        checked={notifications.grades}
                                        onCheckedChange={(checked) => setNotifications({ ...notifications, grades: checked })}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Event Reminders</p>
                                        <p className="text-sm text-muted-foreground">Receive reminders for upcoming events</p>
                                    </div>
                                    <Switch
                                        checked={notifications.events}
                                        onCheckedChange={(checked) => setNotifications({ ...notifications, events: checked })}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </TabsContent>

                <TabsContent value="security">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Security Settings</CardTitle>
                                <CardDescription>Change your password</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="current-password">Current Password</Label>
                                    <Input
                                        id="current-password"
                                        type="password"
                                        value={password.current}
                                        onChange={(e) => setPassword({ ...password, current: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="new-password">New Password</Label>
                                    <Input
                                        id="new-password"
                                        type="password"
                                        value={password.new}
                                        onChange={(e) => setPassword({ ...password, new: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                                    <Input
                                        id="confirm-password"
                                        type="password"
                                        value={password.confirm}
                                        onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
                                    />
                                </div>
                                <Button onClick={handlePasswordChange}>Change Password</Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                </TabsContent>

                <TabsContent value="appearance">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Appearance Settings</CardTitle>
                                <CardDescription>Customize how the app looks</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Theme</p>
                                        <p className="text-sm text-muted-foreground">
                                            Current theme: {theme === 'light' ? 'Light' : 'Dark'}
                                        </p>
                                    </div>
                                    <Button onClick={toggleTheme} variant="outline">
                                        Toggle Theme
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
