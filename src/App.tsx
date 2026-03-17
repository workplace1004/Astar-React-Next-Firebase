import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/LoadingSpinner";
import ScrollToTop from "@/components/ScrollToTop";


// Layouts
import PublicLayout from "@/layouts/PublicLayout";
import PortalLayout from "@/layouts/PortalLayout";
import AdminLayout from "@/layouts/AdminLayout";

// Lazy-loaded pages
const Index = lazy(() => import("@/pages/Index"));
const Manifesto = lazy(() => import("@/pages/Manifesto"));
const About = lazy(() => import("@/pages/About"));
const Blog = lazy(() => import("@/pages/Blog"));
const BlogArticle = lazy(() => import("@/pages/BlogArticle"));
const PortalPreviewPage = lazy(() => import("@/pages/PortalPreviewPage"));
const HowItWorksPage = lazy(() => import("@/pages/HowItWorksPage"));
const Subscribe = lazy(() => import("@/pages/Subscribe"));
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));

const PortalDashboard = lazy(() => import("@/pages/portal/Dashboard"));
const PortalReports = lazy(() => import("@/pages/portal/Reports"));
const BirthChart = lazy(() => import("@/pages/portal/BirthChart"));
const SolarReturn = lazy(() => import("@/pages/portal/SolarReturn"));
const Numerology = lazy(() => import("@/pages/portal/Numerology"));
const Messages = lazy(() => import("@/pages/portal/Messages"));
const Questions = lazy(() => import("@/pages/portal/Questions"));
const Purchase = lazy(() => import("@/pages/portal/Purchase"));
const PortalSubscription = lazy(() => import("@/pages/portal/Subscription"));
const Account = lazy(() => import("@/pages/portal/Account"));
const Notifications = lazy(() => import("@/pages/portal/Notifications"));

const AdminLogin = lazy(() => import("@/pages/admin/Login"));
const AdminDashboard = lazy(() => import("@/pages/admin/Dashboard"));
const AdminUsers = lazy(() => import("@/pages/admin/Users"));
const AdminUserDetail = lazy(() => import("@/pages/admin/UserDetail"));
const AdminQuestions = lazy(() => import("@/pages/admin/Questions"));
const AdminQuestionDetail = lazy(() => import("@/pages/admin/QuestionDetail"));
const AdminMonthlyMessages = lazy(() => import("@/pages/admin/MonthlyMessages"));
const AdminBlog = lazy(() => import("@/pages/admin/Blog"));
const AdminReports = lazy(() => import("@/pages/admin/Reports"));
const AdminKnowledgeBase = lazy(() => import("@/pages/admin/KnowledgeBase"));
const AdminBirthChartInterpretations = lazy(() => import("@/pages/admin/BirthChartInterpretations"));
const AdminOrders = lazy(() => import("@/pages/admin/Orders"));
const AdminNotifications = lazy(() => import("@/pages/admin/Notifications"));
const AdminProfile = lazy(() => import("@/pages/admin/Profile"));

const NotFound = lazy(() => import("@/pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <ScrollToTop />
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* Public pages - Landing has its own layout */}
                <Route path="/" element={<Index />} />
                <Route element={<PublicLayout />}>
                  <Route path="/manifesto" element={<Manifesto />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogArticle />} />
                  <Route path="/portal-preview" element={<PortalPreviewPage />} />
                  <Route path="/how-it-works" element={<HowItWorksPage />} />
                  <Route path="/subscribe" element={<Subscribe />} />
                </Route>

                {/* Standalone auth pages */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/admin/login" element={<AdminLogin />} />

                {/* Client Portal */}
                <Route path="/portal" element={<PortalLayout />}>
                  <Route index element={<PortalDashboard />} />
                  <Route path="reports" element={<PortalReports />} />
                  <Route path="reports/birth-chart" element={<BirthChart />} />
                  <Route path="reports/solar-return" element={<SolarReturn />} />
                  <Route path="reports/numerology" element={<Numerology />} />
                  <Route path="messages" element={<Messages />} />
                  <Route path="questions" element={<Questions />} />
                  <Route path="purchase" element={<Purchase />} />
                  <Route path="subscription" element={<PortalSubscription />} />
                  <Route path="account" element={<Account />} />
                  <Route path="notifications" element={<Notifications />} />
                </Route>

                {/* Admin Dashboard */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="users/:id" element={<AdminUserDetail />} />
                  <Route path="questions" element={<AdminQuestions />} />
                  <Route path="questions/:id" element={<AdminQuestionDetail />} />
                  <Route path="monthly-messages" element={<AdminMonthlyMessages />} />
                  <Route path="blog" element={<AdminBlog />} />
                  <Route path="reports" element={<AdminReports />} />
                  <Route path="knowledge-base" element={<AdminKnowledgeBase />} />
                  <Route path="birth-chart-interpretations" element={<AdminBirthChartInterpretations />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="notifications" element={<AdminNotifications />} />
                  <Route path="profile" element={<AdminProfile />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
