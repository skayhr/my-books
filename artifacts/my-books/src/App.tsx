import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { Layout } from "@/components/layout";
import { Login } from "@/pages/login";
import { Signup } from "@/pages/signup";
import { Home } from "@/pages/home";
import { NewBook } from "@/pages/new-book";
import { Bookcase } from "@/pages/bookcase";
import { BoxDetail } from "@/pages/box-detail";
import { ManageTypes } from "@/pages/manage-types";
import { Report } from "@/pages/report";
import { EmpData } from "@/pages/emp-data";

const queryClient = new QueryClient();

function Router() {
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

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
