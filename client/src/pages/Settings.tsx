import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import ShareLinksManager from "@/components/ShareLinksManager";
import ReportsExport from "@/components/ReportsExport";

export default function Settings() {
  const [, navigate] = useLocation();
  const [targetPercentage, setTargetPercentage] = useState(60);
  const [workingDays, setWorkingDays] = useState<number[]>([1, 2, 3, 4, 5]);

  const getSettings = trpc.attendance.getSettings.useQuery();
  const updateSettings = trpc.attendance.updateSettings.useMutation({
    onSuccess: () => {
      toast.success("Settings updated successfully");
      getSettings.refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update settings");
    },
  });

  const getProfile = trpc.profile.getProfile.useQuery();
  const updateProfile = trpc.profile.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully");
      getProfile.refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");

  // Initialize from fetched data
  useEffect(() => {
    if (getSettings.data) {
      setTargetPercentage(getSettings.data.targetPercentage);
      setWorkingDays(
        getSettings.data.workingDays
          .split(",")
          .map(d => parseInt(d, 10))
      );
    }
  }, [getSettings.data]);

  useEffect(() => {
    if (getProfile.data) {
      setProfileName(getProfile.data.name || "");
      setProfileEmail(getProfile.data.email || "");
    }
  }, [getProfile.data]);

  const dayLabels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const handleSaveSettings = () => {
    updateSettings.mutate({
      targetPercentage,
      workingDays: workingDays.join(","),
    });
  };

  const handleSaveProfile = () => {
    updateProfile.mutate({
      name: profileName || undefined,
      email: profileEmail || undefined,
    });
  };

  const handleWorkingDayToggle = (day: number) => {
    setWorkingDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day].sort()
    );
  };

  const isLoading = getSettings.isLoading || getProfile.isLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your preferences and profile</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                placeholder="your@email.com"
              />
            </div>
            <Button
              onClick={handleSaveProfile}
              disabled={updateProfile.isPending}
              className="w-full"
            >
              {updateProfile.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Profile"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Attendance Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Target</CardTitle>
            <CardDescription>Configure your office attendance goal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Target Percentage</Label>
                <span className="text-2xl font-bold text-primary">{targetPercentage}%</span>
              </div>
              <Slider
                value={[targetPercentage]}
                onValueChange={(value) => setTargetPercentage(value[0])}
                min={10}
                max={100}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                You need to attend at least {targetPercentage}% of your working days
              </p>
            </div>
            <Button
              onClick={handleSaveSettings}
              disabled={updateSettings.isPending}
              className="w-full"
            >
              {updateSettings.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Target"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Working Days */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Working Days</CardTitle>
            <CardDescription>Select which days are considered working days</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-7 gap-3">
              {dayLabels.map((label, idx) => {
                const dayNum = idx + 1;
                return (
                  <div key={dayNum} className="flex items-center space-x-2">
                    <Checkbox
                      id={`day-${dayNum}`}
                      checked={workingDays.includes(dayNum)}
                      onCheckedChange={() => handleWorkingDayToggle(dayNum)}
                    />
                    <Label htmlFor={`day-${dayNum}`} className="text-sm cursor-pointer">
                      {label.slice(0, 3)}
                    </Label>
                  </div>
                );
              })}
            </div>
            <Button
              onClick={handleSaveSettings}
              disabled={updateSettings.isPending}
              className="w-full"
            >
              {updateSettings.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Working Days"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Share Links Manager */}
        <div className="lg:col-span-2">
          <ShareLinksManager />
        </div>

        {/* Reports Export */}
        <div className="lg:col-span-2">
          <ReportsExport />
        </div>
      </div>
    </div>
  );
}
