import { useRoute, Link } from "wouter";
import { useGig } from "@/hooks/use-gigs";
import { useBids, useCreateBid, useHireBid } from "@/hooks/use-bids";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBidSchema, InsertBid } from "@shared/schema";
import { Loader2, ArrowLeft, Clock, DollarSign, CheckCircle2, User as UserIcon } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

export default function GigDetails() {
  const [, params] = useRoute("/gigs/:id");
  const id = parseInt(params?.id || "0");
  const { data: gig, isLoading: gigLoading } = useGig(id);
  const { data: bids, isLoading: bidsLoading } = useBids(id);
  const { user } = useAuth();
  
  const createBidMutation = useCreateBid();
  const hireBidMutation = useHireBid();

  const isOwner = user?.id === gig?.ownerId;
  const isAssigned = gig?.status === "assigned";
  const hasBid = bids?.some(b => b.freelancerId === user?.id);

  const form = useForm<Omit<InsertBid, "freelancerId" | "status" | "gigId">>({
    resolver: zodResolver(insertBidSchema.omit({ freelancerId: true, status: true, gigId: true })),
    defaultValues: {
      price: 0,
      message: "",
    },
  });

  if (gigLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!gig) return <div className="p-8 text-center">Gig not found</div>;

  const onSubmitBid = (data: any) => {
    createBidMutation.mutate({ ...data, gigId: id });
  };

  return (
    <div className="min-h-screen bg-muted/10 pb-20">
      <Navbar />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-10">
        <Link href="/">
          <a className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-6">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
          </a>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl border border-border/60 shadow-sm p-6 md:p-8"
            >
              <div className="flex justify-between items-start gap-4 mb-6">
                <div>
                  <h1 className="text-3xl font-display font-bold text-foreground mb-2">{gig.title}</h1>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" /> Posted {formatDistanceToNow(new Date(gig.createdAt!), { addSuffix: true })}
                    </span>
                    <span className="flex items-center gap-1 text-primary font-medium">
                      <UserIcon className="w-4 h-4" /> by {gig.owner?.name}
                    </span>
                  </div>
                </div>
                <Badge 
                  variant={isAssigned ? "secondary" : "default"} 
                  className={`px-3 py-1 text-sm ${isAssigned ? 'bg-muted text-muted-foreground' : 'bg-green-100 text-green-700'}`}
                >
                  {isAssigned ? "Assigned" : "Open for Bids"}
                </Badge>
              </div>

              <div className="prose prose-slate max-w-none text-foreground/90 leading-relaxed">
                <p className="whitespace-pre-wrap">{gig.description}</p>
              </div>

              <div className="mt-8 pt-6 border-t border-border/50 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Budget</span>
                  <span className="text-2xl font-bold font-mono text-primary">${gig.budget}</span>
                </div>
              </div>
            </motion.div>

            {/* Bids Section (Visible to Owner) */}
            {isOwner && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold font-display">Proposals ({bids?.length || 0})</h2>
                </div>

                <div className="space-y-4">
                  {bidsLoading ? (
                    <div className="h-24 bg-muted animate-pulse rounded-xl" />
                  ) : bids?.length === 0 ? (
                    <div className="p-8 text-center bg-muted/20 rounded-xl border border-dashed border-border">
                      <p className="text-muted-foreground">No proposals yet. Check back soon!</p>
                    </div>
                  ) : (
                    bids?.map((bid) => (
                      <Card key={bid.id} className="overflow-hidden border-border/50 hover:border-primary/30 transition-colors">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex items-start gap-4">
                              <Avatar className="w-10 h-10 border border-border">
                                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                  {bid.freelancer?.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-semibold text-foreground">{bid.freelancer?.name}</h4>
                                <p className="text-sm text-muted-foreground mt-1 mb-3">{bid.message}</p>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="font-mono text-xs border-primary/20 bg-primary/5 text-primary">
                                    Bid: ${bid.price}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(bid.createdAt!), { addSuffix: true })}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                              {bid.status === "hired" ? (
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-0 px-3 py-1">
                                  <CheckCircle2 className="w-3 h-3 mr-1" /> Hired
                                </Badge>
                              ) : isAssigned ? (
                                <Badge variant="secondary" className="opacity-50">Not Selected</Badge>
                              ) : (
                                <Button 
                                  size="sm"
                                  onClick={() => hireBidMutation.mutate({ bidId: bid.id, gigId: id })}
                                  disabled={hireBidMutation.isPending}
                                  className="bg-primary hover:bg-primary/90 shadow-md shadow-primary/20"
                                >
                                  {hireBidMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Hire"}
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar (Freelancer Actions) */}
          <div className="lg:col-span-1">
            {!isOwner && user && !isAssigned && !hasBid && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="sticky top-24 border-primary/20 shadow-lg shadow-primary/5 overflow-hidden">
                  <div className="h-1.5 w-full bg-gradient-to-r from-primary to-accent" />
                  <CardHeader>
                    <CardTitle className="font-display">Submit a Proposal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmitBid)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Your Price ($)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  className="font-mono" 
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cover Letter</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Why are you the best fit?" 
                                  className="resize-none min-h-[120px]" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button 
                          type="submit" 
                          className="w-full bg-primary hover:bg-primary/90 font-semibold shadow-lg shadow-primary/25"
                          disabled={createBidMutation.isPending}
                        >
                          {createBidMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Place Bid"}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {!isOwner && hasBid && (
               <motion.div
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.3 }}
               className="sticky top-24 p-6 bg-green-50 border border-green-200 rounded-2xl"
             >
               <div className="flex flex-col items-center text-center">
                 <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                   <CheckCircle2 className="w-6 h-6" />
                 </div>
                 <h3 className="font-bold text-green-800 text-lg">Proposal Submitted</h3>
                 <p className="text-green-700/80 text-sm mt-2">
                   You've already placed a bid on this gig. We'll notify you if you're hired!
                 </p>
               </div>
             </motion.div>
            )}

            {!user && (
              <div className="sticky top-24 p-6 bg-muted/30 border border-border rounded-2xl text-center">
                <h3 className="font-bold text-foreground mb-2">Want to apply?</h3>
                <p className="text-sm text-muted-foreground mb-4">Log in to submit a proposal for this project.</p>
                <Link href="/auth/login">
                  <Button className="w-full">Log In</Button>
                </Link>
              </div>
            )}
            
            {isAssigned && !isOwner && (
               <div className="sticky top-24 p-6 bg-muted border border-border rounded-2xl text-center">
                 <h3 className="font-bold text-foreground mb-2">Project Closed</h3>
                 <p className="text-sm text-muted-foreground">This gig has already been assigned to a freelancer.</p>
               </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
