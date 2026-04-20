import { useState } from "react";
import { Bell, BellOff, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePushNotifications } from "@/hooks/usePushNotifications";

export function NotificationSettings() {
  const {
    isSupported,
    isSubscribed,
    isLoading,
    error,
    permission,
    subscribe,
    unsubscribe,
  } = usePushNotifications();

  const [showDetails, setShowDetails] = useState(false);

  if (!isSupported) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            Push Notifications Not Supported
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Your browser doesn't support push notifications. Please use a modern browser like Chrome, Firefox, or Edge.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isSubscribed ? (
            <Bell className="w-5 h-5 text-green-600" />
          ) : (
            <BellOff className="w-5 h-5 text-gray-400" />
          )}
          Push Notifications
        </CardTitle>
        <CardDescription>
          Receive notifications about your attendance and office status
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium text-sm">Status</p>
            <p className="text-xs text-gray-600">
              {isSubscribed ? "Notifications enabled" : "Notifications disabled"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isSubscribed && <CheckCircle className="w-5 h-5 text-green-600" />}
            {!isSubscribed && <AlertCircle className="w-5 h-5 text-gray-400" />}
          </div>
        </div>

        {/* Permission Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium text-sm">Permission</p>
            <p className="text-xs text-gray-600 capitalize">{permission}</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {!isSubscribed ? (
            <Button
              onClick={subscribe}
              disabled={isLoading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isLoading ? "Enabling..." : "Enable Notifications"}
            </Button>
          ) : (
            <Button
              onClick={unsubscribe}
              disabled={isLoading}
              variant="outline"
              className="flex-1"
            >
              {isLoading ? "Disabling..." : "Disable Notifications"}
            </Button>
          )}
        </div>

        {/* Details */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-blue-600 hover:text-blue-700 underline"
        >
          {showDetails ? "Hide" : "Show"} technical details
        </button>

        {showDetails && (
          <div className="p-3 bg-gray-50 rounded-lg text-xs font-mono text-gray-700 space-y-1">
            <p>Browser Support: ✓</p>
            <p>Service Worker: {("serviceWorker" in navigator) ? "✓" : "✗"}</p>
            <p>Push Manager: {("PushManager" in window) ? "✓" : "✗"}</p>
            <p>Notification API: {("Notification" in window) ? "✓" : "✗"}</p>
            <p>Permission: {permission}</p>
          </div>
        )}

        <p className="text-xs text-gray-500">
          Notifications help you stay updated about your attendance status and office schedule.
        </p>
      </CardContent>
    </Card>
  );
}
