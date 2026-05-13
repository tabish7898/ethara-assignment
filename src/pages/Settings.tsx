import React from "react";
import { useAuth } from "@/src/contexts/AuthContext";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon, Bell, Shield, Palette } from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const { profile } = useAuth();

  const handleSave = () => {
    toast.success("Settings saved successfully!");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account preferences and application settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-1">
          <h3 className="font-semibold text-slate-900">Profile Information</h3>
          <p className="text-sm text-slate-500">Update your personal details and how others see you.</p>
        </div>
        
        <Card className="md:col-span-2 border-none shadow-sm rounded-3xl overflow-hidden bg-white">
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center gap-6">
              <Avatar className="w-20 h-20 border-4 border-slate-50 shadow-sm">
                <AvatarImage src={profile?.photoURL} />
                <AvatarFallback className="bg-slate-100 text-slate-400 text-xl font-bold">
                  {profile?.displayName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <Button variant="outline" className="rounded-xl h-9 text-xs">Change Avatar</Button>
                <p className="text-xs text-slate-400 mt-2">JPG, GIF or PNG. Max size of 800K</p>
              </div>
            </div>

            <Separator className="bg-slate-50" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-widest text-slate-400 font-bold ml-1">Full Name</Label>
                <Input defaultValue={profile?.displayName} className="rounded-xl h-11 border-slate-200" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-widest text-slate-400 font-bold ml-1">Email Address</Label>
                <Input defaultValue={profile?.email} disabled className="rounded-xl h-11 bg-slate-50 border-slate-200" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-widest text-slate-400 font-bold ml-1">Role</Label>
              <div className="flex">
                <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 border-none rounded-full px-4 py-1">
                  {profile?.role}
                </Badge>
              </div>
            </div>

            <div className="pt-4">
              <Button onClick={handleSave} className="bg-[#1a1a1a] hover:bg-black text-white rounded-xl px-8 h-12 shadow-lg">
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator className="bg-slate-200" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-1">
          <h3 className="font-semibold text-slate-900">Preferences</h3>
          <p className="text-sm text-slate-500">Configure notifications and interface behavior.</p>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card className="border-none shadow-sm rounded-3xl bg-white hover:bg-slate-50/50 transition-colors cursor-pointer group">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Email Notifications</h4>
                  <p className="text-sm text-slate-500">Receive weekly digests and task updates.</p>
                </div>
              </div>
              <div className="w-12 h-6 bg-emerald-500 rounded-full relative">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-3xl bg-white hover:bg-slate-50/50 transition-colors cursor-pointer group">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-100 rounded-2xl text-slate-600">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Dark Mode</h4>
                  <p className="text-sm text-slate-500">Switch between light and dark themes.</p>
                </div>
              </div>
              <div className="w-12 h-6 bg-slate-200 rounded-full relative">
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
