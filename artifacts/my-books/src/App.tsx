import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { setBaseUrl } from "@workspace/api-client-react";
import { AppProvider } from "@/lib/app-context";
import { AuthProvider, useAuth } from "@/lib/auth";
import { PhoneLayout } from "./pages/phone-layout";

import { Layout } from "@/components/layout";
import { Login } from "@/pages/login";
import { Signup } from "@/pages/signup";
import { Home } from "@/pages/home";
import { NewBook } from "@/pages/new-book";
import { Bookcase } from "@/pages/bookcase";
import { BoxDetail } from "@/pages/box-detail";
import { ManageTypes } from "@/pages/manage-types";
import { Report } from "@/pages/report"; // This was the problematic import
import { EmpData } from "@/pages/emp-data";
import { Profile } from "./pages/profile";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      // In a real app, you would want to retry, but for this demo,
      // it's better to fail fast.
      retry: false,
    },
  },
});

// Set the base URL for the API client to the API server's address
const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV
    ? `${window.location.protocol}//${window.location.hostname}:5000`
    : window.location.origin);

console.info("API base URL:", apiBaseUrl);
setBaseUrl(apiBaseUrl);

function Router() {
  const { user } = useAuth();

  // If the user is logged in and in phone mode, render the phone layout
  if (user && user.mode === "phone") {
    return <PhoneLayout />;
  }

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />

      <Route path="/">
        <Layout><Home /></Layout>
      </Route>
      <Route path="/new-book">
        <Layout><NewBook /></Layout>
      </Route>
      <Route path="/bookcase">
        <Layout><Bookcase /></Layout>
      </Route>
      <Route path="/bookcase/manage">
        <Layout><ManageTypes /></Layout>
      </Route>
      <Route path="/bookcase/:code">
        <Layout><BoxDetail /></Layout>
      </Route>
      <Route path="/report">
        <Layout><Report /></Layout>
      </Route>
      <Route path="/emp-data">
        <Layout><EmpData /></Layout>
      </Route>
      <Route path="/profile">
        <Layout><Profile /></Layout>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <AppProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </QueryClientProvider>
      </AuthProvider>
    </AppProvider>
  );
}

export default App;
