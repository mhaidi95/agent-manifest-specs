import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "./pages/Landing";
import Spec from "./pages/Spec";
import Validator from "./pages/Validator";
import BadgePage from "./pages/BadgePage";
import Docs from "./pages/Docs";
import GettingStarted from "./pages/GettingStarted";
import Auth from "./pages/Auth";
import AppLayout from "./pages/app/AppLayout";
import Overview from "./pages/app/Overview";
import Apps from "./pages/app/Apps";
import Actions from "./pages/app/Actions";
import Permissions from "./pages/app/Permissions";
import Approvals from "./pages/app/Approvals";
import Logs from "./pages/app/Logs";
import Tokens from "./pages/app/Tokens";
import PendingApprovals from "./pages/app/PendingApprovals";
import AdminMetrics from "./pages/app/AdminMetrics";
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
          <Route path="/validator" element={<Validator />} />
          <Route path="/badge" element={<BadgePage />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/getting-started" element={<GettingStarted />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Overview />} />
            <Route path="apps" element={<Apps />} />
            <Route path="actions" element={<Actions />} />
            <Route path="permissions" element={<Permissions />} />
            <Route path="approvals" element={<Approvals />} />
            <Route path="pending" element={<PendingApprovals />} />
            <Route path="tokens" element={<Tokens />} />
            <Route path="logs" element={<Logs />} />
            <Route path="admin" element={<AdminMetrics />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
