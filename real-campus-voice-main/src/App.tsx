import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { useStore } from "@/lib/store";
import { useEffect } from "react";
import Index from "./pages/Index.tsx";
import CreatePost from "./pages/CreatePost.tsx";
import PostDetail from "./pages/PostDetail.tsx";
import AdminLogin from "./pages/AdminLogin.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import Auth from "./pages/Auth.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex h-screen w-full relative overflow-hidden bg-background">
    {/* Animated Background Blobs */}
    <div className="blob top-[-10%] left-[-10%] opacity-20 dark:opacity-10" />
    <div className="blob bottom-[-10%] right-[-10%] bg-secondary/20 opacity-20 dark:opacity-10" style={{ animationDelay: '-10s' }} />
    
    <AppSidebar />
    <div className="flex-1 flex flex-col h-full relative z-10 lg:pl-72 overflow-hidden">
      <AppHeader />
      <main className="flex-1 overflow-y-auto custom-scrollbar">{children}</main>
    </div>
  </div>
);

const AppInner = () => {
  const { darkMode, initUser, subscribeToChanges } = useStore();
  
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    initUser();
    const unsubscribe = subscribeToChanges();
    return () => unsubscribe();
  }, [initUser, subscribeToChanges]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="*" element={
          <AppLayout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/create" element={<CreatePost />} />
              <Route path="/post/:id" element={<PostDetail />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        } />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <AppInner />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
