import { useEffect, useState } from "react";
import { trpc } from "../lib/trpc";

/**
 * Hook to manage push notifications
 * Handles service worker registration, subscription, and permission requests
 */
export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  const subscribeQuery = trpc.notifications.subscribe.useMutation();
  const unsubscribeQuery = trpc.notifications.unsubscribe.useMutation();
  const isEnabledQuery = trpc.notifications.isEnabled.useQuery();

  // Check if push notifications are supported
  useEffect(() => {
    const supported =
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window;
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);
    }
  }, []);

  // Check subscription status
  useEffect(() => {
    if (isEnabledQuery.data !== undefined) {
      setIsSubscribed(isEnabledQuery.data);
    }
  }, [isEnabledQuery.data]);

  /**
   * Request notification permission from user
   */
  const requestPermission = async () => {
    if (!isSupported) {
      setError("Push notifications not supported");
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      return permission === "granted";
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(`Permission request failed: ${message}`);
      return false;
    }
  };

  /**
   * Subscribe to push notifications
   */
  const subscribe = async () => {
    if (!isSupported) {
      setError("Push notifications not supported");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Request permission if not already granted
      if (Notification.permission !== "granted") {
        const granted = await requestPermission();
        if (!granted) {
          setIsLoading(false);
          return false;
        }
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });

      // Get push subscription
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        // Create new subscription
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.VITE_VAPID_PUBLIC_KEY,
        });
      }

      // Send subscription to server
      const { endpoint, keys } = subscription.toJSON();
      if (!endpoint || !keys?.auth || !keys?.p256dh) {
        throw new Error("Invalid subscription data");
      }

      await subscribeQuery.mutateAsync({
        endpoint,
        auth: keys.auth,
        p256dh: keys.p256dh,
      });

      setIsSubscribed(true);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(`Subscription failed: ${message}`);
      console.error("[usePushNotifications] Subscribe error:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Unsubscribe from push notifications
   */
  const unsubscribe = async () => {
    if (!isSupported) {
      setError("Push notifications not supported");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const { endpoint } = subscription.toJSON();
        if (endpoint) {
          await unsubscribeQuery.mutateAsync({ endpoint });
        }
        await subscription.unsubscribe();
      }

      setIsSubscribed(false);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(`Unsubscription failed: ${message}`);
      console.error("[usePushNotifications] Unsubscribe error:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isSupported,
    isSubscribed,
    isLoading,
    error,
    permission,
    requestPermission,
    subscribe,
    unsubscribe,
  };
}
