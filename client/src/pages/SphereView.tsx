import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin } from "lucide-react";
import { useLocation } from "wouter";

const OFFICE_LOCATIONS = [
  "Minneapolis Plaza",
  "Hopkins, MN",
  "Irwing, TX",
  "Atlanta",
  "Cincinati",
  "Bay Area",
  "New York",
  "New Jersey",
  "Charlotte, NC",
  "Columbia Center, OR",
];

export default function SphereView() {
  const params = useParams();
  const [, navigate] = useLocation();
  const sphereId = parseInt(params.id || "0");

  const members = trpc.sphere.getMembers.useQuery(
    { sphereId },
    { enabled: sphereId > 0 }
  );

  if (!sphereId) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Invalid sphere</p>
        <Button onClick={() => navigate("/sphere")} className="mt-4">
          Back to Sphere
        </Button>
      </div>
    );
  }

  if (members.isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading sphere...</p>
      </div>
    );
  }

  // Group members by location
  const membersByLocation: Record<string, any[]> = {};
  OFFICE_LOCATIONS.forEach(loc => {
    membersByLocation[loc] = [];
  });

  (members.data || []).forEach((member: any) => {
    if (member.location && member.status === "office") {
      if (!membersByLocation[member.location]) {
        membersByLocation[member.location] = [];
      }
      membersByLocation[member.location].push(member);
    }
  });

  // Count members on office days
  const officeMembers = members.data?.filter(m => m.status === "office") || [];
  const wfhMembers = members.data?.filter(m => m.status === "wfh") || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/sphere")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sphere View</h1>
          <p className="text-muted-foreground mt-1">
            {officeMembers.length} in office • {wfhMembers.length} WFH
          </p>
        </div>
      </div>

      {/* Location Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {OFFICE_LOCATIONS.map(location => {
          const locationMembers = membersByLocation[location] || [];
          return (
            <Card key={location} className={locationMembers.length > 0 ? "border-blue-200 bg-blue-50" : ""}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  {location}
                </CardTitle>
                <CardDescription>
                  {locationMembers.length} {locationMembers.length === 1 ? "person" : "people"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {locationMembers.length > 0 ? (
                  <div className="space-y-2">
                    {locationMembers.map(member => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-2 bg-white rounded-lg border"
                      >
                        <div>
                          <p className="font-medium text-sm">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          🏢 Office
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No one here today
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* WFH Members */}
      {wfhMembers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Working from Home</CardTitle>
            <CardDescription>{wfhMembers.length} members</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {wfhMembers.map(member => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-2 bg-muted rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </div>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    🏠 WFH
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
