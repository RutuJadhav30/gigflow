import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { insertUserSchema, InsertUser } from "@shared/schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Briefcase } from "lucide-react";
import { motion } from "framer-motion";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export default function AuthPage({ mode }: { mode: "login" | "register" }) {
  const { loginMutation, registerMutation, user } = useAuth();
  const [, setLocation] = useLocation();

  if (user) {
    setLocation("/");
    return null;
  }

  const isLogin = mode === "login";
  const mutation = isLogin ? loginMutation : registerMutation;

  const form = useForm({
    resolver: zodResolver(isLogin ? loginSchema : insertUserSchema),
    defaultValues: {
      name: "",
      email: "", // UI says "Email", maps to username/email in backend
      password: "",
    },
  });

  const onSubmit = (data: any) => {
    // For register, we include name. For login, just email/pass.
    // Schema handles validation. Backend routes map email -> username if needed.
    if (isLogin) {
      mutation.mutate(data);
    } else {
      // Register needs username field to match schema
      mutation.mutate({ ...data, username: data.email });
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Panel - Visual */}
      <div className="hidden lg:flex flex-col justify-between bg-zinc-900 p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 z-0" />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center backdrop-blur-sm">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">GigFlow</span>
          </div>
        </div>

        <div className="relative z-10 max-w-lg">
          <h1 className="text-4xl font-display font-bold leading-tight mb-4">
            Where talent meets opportunity.
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed">
            Join thousands of professionals and clients building the future of work together. Simple, fast, and secure.
          </p>
        </div>
        
        <div className="relative z-10 text-sm text-zinc-500">
          © 2024 GigFlow Inc. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex items-center justify-center p-6 bg-background">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8 lg:hidden">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
            </div>
            <h1 className="font-display font-bold text-2xl">GigFlow</h1>
          </div>

          <Card className="border-border/50 shadow-xl shadow-black/5">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold font-display">
                {isLogin ? "Welcome back" : "Create an account"}
              </CardTitle>
              <CardDescription>
                {isLogin ? "Enter your credentials to access your account" : "Enter your details to get started"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {!isLogin && (
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" className="h-11" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="name@example.com" type="email" className="h-11" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input placeholder="••••••••" type="password" className="h-11" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full h-11 bg-primary hover:bg-primary/90 font-semibold shadow-lg shadow-primary/25 mt-2" 
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isLogin ? "Sign In" : "Create Account"}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-center border-t border-border/30 pt-6">
              <p className="text-sm text-muted-foreground">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                <Button variant="link" className="p-0 h-auto font-semibold text-primary" onClick={() => setLocation(isLogin ? "/auth/register" : "/auth/login")}>
                  {isLogin ? "Sign up" : "Log in"}
                </Button>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
