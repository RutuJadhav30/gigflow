import { useState } from "react";
import { useGigs } from "@/hooks/use-gigs";
import { Navbar } from "@/components/Navbar";
import { GigCard } from "@/components/GigCard";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const [search, setSearch] = useState("");
  const { data: gigs, isLoading, error } = useGigs(search);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70"
          >
            Find your next <span className="text-primary">big project</span>.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground mb-8"
          >
            Connect with top clients and talented freelancers in the most simplified marketplace ever built.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative max-w-lg mx-auto"
          >
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <Input
              type="text"
              placeholder="Search for gigs (e.g. 'React Developer', 'Logo Design')..."
              className="pl-11 py-6 rounded-2xl shadow-xl shadow-primary/5 border-border/50 focus:ring-primary/20 text-base"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </motion.div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold font-display">
              {search ? 'Search Results' : 'Latest Gigs'}
            </h2>
            <span className="text-sm text-muted-foreground font-medium">
              {gigs?.length || 0} projects available
            </span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 rounded-2xl bg-muted/50 animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-20 rounded-3xl bg-red-50 text-red-600">
              <p>Failed to load gigs. Please try again later.</p>
            </div>
          ) : gigs?.length === 0 ? (
            <div className="text-center py-20 rounded-3xl bg-muted/30 border border-dashed border-muted-foreground/20">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">No gigs found</h3>
              <p className="text-muted-foreground mt-2">Try adjusting your search terms or check back later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gigs?.map((gig, index) => (
                <motion.div
                  key={gig.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <GigCard gig={gig} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
