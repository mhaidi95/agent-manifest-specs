import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "./pages/Landing";
import Spec from "./pages/Spec";
import Auth from "./pages/Auth";
import AppLayout from "./pages/app/AppLayout";
import Overview from "./pages/app/Overview";
import Apps from "./pages/app/Apps";
import Actions from "./pages/app/Actions";
import Permissions from "./pages/app/Permissions";
import Approvals from "./pages/app/Approvals";
import Logs from "./pages/app/Logs";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/spec" element={<Spec />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Overview />} />
            <Route path="apps" element={<Apps />} />
            <Route path="actions" element={<Actions />} />
            <Route path="permissions" element={<Permissions />} />
            <Route path="approvals" element={<Approvals />} />
            <Route path="logs" element={<Logs />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
