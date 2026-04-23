import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Users, Plus } from "lucide-react";
import { useLocation } from "wouter";

export default function Sphere() {
  const [, navigate] = useLocation();
  const [sphereName, setSphereName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [copied, setCopied] = useState(false);

  // Get user's sphere
  const userSphere = trpc.sphere.getOwn.useQuery();

  // Create sphere mutation
  const createSphere = trpc.sphere.create.useMutation({
    onSuccess: () => {
      setSphereName("");
      userSphere.refetch();
    },
  });

  // Join sphere mutation
  const joinSphere = trpc.sphere.join.useMutation({
    onSuccess: () => {
      setJoinCode("");
      userSphere.refetch();
    },
  });

  const handleCreateSphere = () => {
    if (sphereName.trim()) {
      createSphere.mutate({ name: sphereName });
    }
  };

  const handleJoinSphere = () => {
    if (joinCode.trim()) {
      joinSphere.mutate({ code: joinCode });
    }
  };

  const handleCopyCode = () => {
    if (userSphere.data?.code) {
      navigator.clipboard.writeText(userSphere.data.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sphere</h1>
        <p className="text-muted-foreground mt-1">
          Collaborate with your team — see who's at which location
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create or View Sphere */}
        {!userSphere.data ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create a Sphere
              </CardTitle>
              <CardDescription>
                Start a sphere to collaborate with your team
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Sphere Name</label>
                <Input
                  placeholder="e.g., Engineering Team, Bay Area Office"
                  value={sphereName}
                  onChange={e => setSphereName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleCreateSphere()}
                />
              </div>
              <Button
                onClick={handleCreateSphere}
                disabled={!sphereName.trim() || createSphere.isPending}
                className="w-full"
              >
                {createSphere.isPending ? "Creating..." : "Create Sphere"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {userSphere.data.name}
              </CardTitle>
              <CardDescription>Your sphere</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Invite Code</label>
                <div className="flex gap-2">
                  <code className="flex-1 px-3 py-2 bg-muted rounded-lg font-mono text-sm break-all">
                    {userSphere.data.code}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyCode}
                    className="shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                {copied && (
                  <p className="text-xs text-green-600 mt-2">✓ Copied to clipboard</p>
                )}
              </div>
              <Button
                onClick={() => userSphere.data && navigate(`/sphere/${userSphere.data.id}`)}
                className="w-full"
              >
                View Sphere
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Join Sphere */}
        <Card>
          <CardHeader>
            <CardTitle>Join a Sphere</CardTitle>
            <CardDescription>
              Enter an invite code to join a sphere
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Invite Code</label>
              <Input
                placeholder="e.g., sphere_abc123..."
                value={joinCode}
                onChange={e => setJoinCode(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleJoinSphere()}
              />
            </div>
            <Button
              onClick={handleJoinSphere}
              disabled={!joinCode.trim() || joinSphere.isPending}
              variant="outline"
              className="w-full"
            >
              {joinSphere.isPending ? "Joining..." : "Join Sphere"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
