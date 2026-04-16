import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Copy, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

export default function ShareLinksManager() {
  const [expiresInDays, setExpiresInDays] = useState(30);

  const getShareLinks = trpc.attendance.getShareLinks.useQuery();
  const createShareLink = trpc.attendance.createShareLink.useMutation({
    onSuccess: () => {
      getShareLinks.refetch();
      toast.success("Share link created!");
      setExpiresInDays(30);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create share link");
    },
  });

  const deleteShareLink = trpc.attendance.deleteShareLink.useMutation({
    onSuccess: () => {
      getShareLinks.refetch();
      toast.success("Share link deleted");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete share link");
    },
  });

  const handleCreateShareLink = () => {
    createShareLink.mutate({ expiresInDays });
  };

  const handleCopyLink = (token: string) => {
    const url = `${window.location.origin}/share/${token}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  const handleDeleteLink = (token: string) => {
    if (confirm("Are you sure you want to delete this share link?")) {
      deleteShareLink.mutate({ token });
    }
  };

  const links = getShareLinks.data || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Share Your Dashboard</CardTitle>
        <CardDescription>Create shareable links to your attendance summary</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Create New Link */}
        <div className="space-y-4 p-4 bg-muted rounded-lg">
          <div className="space-y-2">
            <Label htmlFor="expires">Expires in (days)</Label>
            <Input
              id="expires"
              type="number"
              min="1"
              max="365"
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(parseInt(e.target.value, 10))}
              disabled={createShareLink.isPending}
            />
          </div>
          <Button
            onClick={handleCreateShareLink}
            disabled={createShareLink.isPending}
            className="w-full"
          >
            {createShareLink.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create New Share Link
              </>
            )}
          </Button>
        </div>

        {/* Existing Links */}
        {links.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No share links created yet.</p>
            <p className="text-sm">Create one above to share your attendance with others.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <h3 className="font-semibold">Active Share Links</h3>
            {links.map((link) => {
              const expiresAt = link.expiresAt ? new Date(link.expiresAt) : null;
              const isExpired = expiresAt && expiresAt < new Date();
              const url = `${window.location.origin}/share/${link.token}`;

              return (
                <div
                  key={link.token}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-mono text-muted-foreground truncate">{link.token}</p>
                    {expiresAt && (
                      <p className={`text-xs ${isExpired ? "text-destructive" : "text-muted-foreground"}`}>
                        {isExpired ? "Expired" : `Expires ${expiresAt.toLocaleDateString()}`}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyLink(link.token)}
                      disabled={isExpired || false}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteLink(link.token)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900">
            <strong>Privacy Note:</strong> Share links display only your attendance summary and monthly progress. No personal information is exposed.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
