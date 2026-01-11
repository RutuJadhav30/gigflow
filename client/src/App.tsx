import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import PostGig from "@/pages/PostGig";
import GigDetails from "@/pages/GigDetails";
import AuthPage from "@/pages/Auth";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/gigs/new" component={PostGig} />
      <Route path="/gigs/:id" component={GigDetails} />
      <Route path="/auth/login">
        {() => <AuthPage mode="login" />}
      </Route>
      <Route path="/auth/register">
        {() => <AuthPage mode="register" />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
