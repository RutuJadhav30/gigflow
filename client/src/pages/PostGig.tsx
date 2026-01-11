import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertGigSchema, InsertGig } from "@shared/schema";
import { useCreateGig } from "@/hooks/use-gigs";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Loader2, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function PostGig() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const createGigMutation = useCreateGig();

  const form = useForm<Omit<InsertGig, "ownerId" | "status">>({
    resolver: zodResolver(insertGigSchema.omit({ ownerId: true, status: true })),
    defaultValues: {
      title: "",
      description: "",
      budget: 0,
    },
  });

  // Redirect if not logged in
  if (!user) {
    setLocation("/auth/login");
    return null;
  }

  function onSubmit(data: Omit<InsertGig, "ownerId">) {
    createGigMutation.mutate(data, {
      onSuccess: () => setLocation("/"),
    });
  }

  return (
    <div className="min-h-screen bg-muted/20 pb-20">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 pt-12">
        <div className="mb-6">
          <Link href="/">
            <a className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-4">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
            </a>
          </Link>
          <h1 className="text-3xl font-bold font-display tracking-tight">Post a New Gig</h1>
          <p className="text-muted-foreground mt-2">Describe the project and budget to attract top talent.</p>
        </div>

        <Card className="p-6 md:p-8 shadow-xl shadow-black/5 border-border/60">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">Project Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. Build a Responsive React Website" 
                        className="h-12 text-lg" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">Budget ($)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">$</span>
                          <Input 
                            type="number" 
                            className="pl-7 h-12 text-lg font-mono" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Detail the requirements, deliverables, and timeline..." 
                        className="min-h-[200px] resize-none text-base leading-relaxed p-4" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4 flex items-center justify-end gap-4">
                <Link href="/">
                  <Button type="button" variant="ghost" className="h-12 px-6">Cancel</Button>
                </Link>
                <Button 
                  type="submit" 
                  disabled={createGigMutation.isPending}
                  className="h-12 px-8 bg-primary hover:bg-primary/90 text-lg font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40 hover:-translate-y-0.5"
                >
                  {createGigMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    "Publish Gig"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </Card>
      </main>
    </div>
  );
}
