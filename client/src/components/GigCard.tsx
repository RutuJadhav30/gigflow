import { Link } from "wouter";
import { GigResponse } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, DollarSign, ArrowRight } from "lucide-react";

interface GigCardProps {
  gig: GigResponse;
}

export function GigCard({ gig }: GigCardProps) {
  const isAssigned = gig.status === "assigned";

  return (
    <Link href={`/gigs/${gig.id}`}>
      <Card className={`group relative h-full flex flex-col border-border/50 bg-card hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 cursor-pointer overflow-hidden ${isAssigned ? 'opacity-75 grayscale-[0.5]' : ''}`}>
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start gap-4">
            <h3 className="font-display font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">
              {gig.title}
            </h3>
            <Badge 
              variant={isAssigned ? "secondary" : "default"} 
              className={`${isAssigned ? 'bg-muted text-muted-foreground' : 'bg-green-100 text-green-700 hover:bg-green-200'} border-0 px-2.5 py-0.5`}
            >
              {gig.status === "open" ? "Open" : "Assigned"}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="flex-grow pb-4">
          <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
            {gig.description}
          </p>
          
          <div className="flex items-center gap-4 text-sm font-medium text-foreground/80">
            <div className="flex items-center gap-1.5 bg-primary/5 px-2.5 py-1 rounded-md text-primary">
              <DollarSign className="w-4 h-4" />
              <span>${gig.budget}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{formatDistanceToNow(new Date(gig.createdAt || new Date()), { addSuffix: true })}</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-0 border-t border-border/30 mt-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="w-6 h-6 border border-border">
              <AvatarFallback className="text-[10px] bg-secondary">
                {gig.owner?.name?.substring(0, 2).toUpperCase() || "??"}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium text-muted-foreground">
              Posted by {gig.owner?.name || "Unknown"}
            </span>
          </div>
          
          <span className="text-xs font-semibold text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0">
            View Details <ArrowRight className="w-3 h-3" />
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
