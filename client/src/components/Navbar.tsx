import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Briefcase, LogOut, Plus, User } from "lucide-react";

export function Navbar() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-lg border-b border-border/40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-lg shadow-primary/20 transition-transform group-hover:scale-110 duration-200">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                GigFlow
              </span>
            </Link>
            
            <div className="hidden md:flex items-center gap-1">
              <Link href="/">
                <a className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location === "/" 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}>
                  Find Work
                </a>
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link href="/gigs/new">
                  <Button variant="default" className="hidden sm:flex items-center gap-2 bg-primary hover:bg-primary/90 rounded-xl shadow-lg shadow-primary/20">
                    <Plus className="w-4 h-4" />
                    Post a Gig
                  </Button>
                </Link>
                
                <div className="flex items-center gap-3 pl-2 border-l border-border/50">
                  <div className="hidden md:flex flex-col items-end">
                    <span className="text-sm font-semibold text-foreground">{user.name}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => logoutMutation.mutate()}
                    disabled={logoutMutation.isPending}
                    className="rounded-xl hover:bg-red-50 hover:text-destructive transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/auth/login">
                  <Button variant="ghost" className="font-medium">Log in</Button>
                </Link>
                <Link href="/auth/register">
                  <Button className="bg-foreground text-background hover:bg-foreground/90 rounded-xl">
                    Sign up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
