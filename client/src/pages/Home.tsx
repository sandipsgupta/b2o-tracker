import { useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Calendar, Zap, Share2, TrendingUp, Brain } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return null;
  }

  if (isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Navigation */}
      <nav className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">B2O Tracker</span>
          </div>
          <Button asChild>
            <a href={getLoginUrl()}>Sign In</a>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Master Your Office Attendance
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Track, plan, and optimize your in-office days with AI-powered insights. Hit your attendance targets effortlessly.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <a href={getLoginUrl()}>Get Started Free</a>
          </Button>
          <Button size="lg" variant="outline">
            Learn More
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <Card className="border-border/40 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>Easy Logging</CardTitle>
              <CardDescription>Log your attendance with a single click</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Mark Office Days or WFH status directly on an intuitive calendar. No complicated forms.
              </p>
            </CardContent>
          </Card>

          {/* Feature 2 */}
          <Card className="border-border/40 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle>Smart Analytics</CardTitle>
              <CardDescription>Visualize your attendance patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                See weekly and monthly progress with beautiful charts and real-time statistics.
              </p>
            </CardContent>
          </Card>

          {/* Feature 3 */}
          <Card className="border-border/40 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle>Target Tracking</CardTitle>
              <CardDescription>Stay on track with your 60% goal</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Automatically calculate remaining days needed and get clear visibility on your progress.
              </p>
            </CardContent>
          </Card>

          {/* Feature 4 */}
          <Card className="border-border/40 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-amber-600" />
              </div>
              <CardTitle>AI Insights</CardTitle>
              <CardDescription>Get personalized recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Receive actionable suggestions powered by AI to optimize your attendance strategy.
              </p>
            </CardContent>
          </Card>

          {/* Feature 5 */}
          <Card className="border-border/40 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center mb-4">
                <Share2 className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle>Share Dashboards</CardTitle>
              <CardDescription>Share read-only attendance summaries</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Generate shareable links to show your attendance to managers or team leads.
              </p>
            </CardContent>
          </Card>

          {/* Feature 6 */}
          <Card className="border-border/40 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-cyan-100 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-cyan-600" />
              </div>
              <CardTitle>Future Planning</CardTitle>
              <CardDescription>Plan your office days ahead</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Mark planned office days and let the system help you forecast your attendance.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-12 text-center space-y-6">
            <h2 className="text-3xl font-bold">Ready to optimize your attendance?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start tracking your office days today and get AI-powered insights to help you meet your targets.
            </p>
            <Button size="lg" asChild>
              <a href={getLoginUrl()}>Sign In Now</a>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 mt-20">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 B2O Tracker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
