import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import ExpertList from "./pages/ExpertList";
import ExpertDetail from "./pages/ExpertDetail";
import BookingPage from "./pages/BookingPage";
import MyBookings from "./pages/MyBookings";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ExpertDashboard from "./pages/ExpertDashboard";
import LandingPage from "./pages/LandingPage";

// Wrapper for home page - show landing for guests, expert list for logged-in users
function HomeWrapper() {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) return null;
  
  // Not logged in - show landing page
  if (!isAuthenticated) {
    return <LandingPage />;
  }
  
  // Experts go to dashboard
  if (user?.role === "expert") {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Regular users see expert list
  return <ExpertList />;
}

function ExpertDetailWrapper() {
  const { user, isAuthenticated } = useAuth();
  if (isAuthenticated && user?.role === "expert") {
    return <Navigate to="/dashboard" replace />;
  }
  return <ExpertDetail />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-950 text-gray-100">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<HomeWrapper />} />
              <Route path="/experts" element={<ExpertList />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/expert/:id" element={<ExpertDetailWrapper />} />
              <Route
                path="/booking/:expertId"
                element={
                  <ProtectedRoute denyRole="expert">
                    <BookingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-bookings"
                element={
                  <ProtectedRoute denyRole="expert">
                    <MyBookings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute requiredRole="expert">
                    <ExpertDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#1f2937",
                color: "#f3f4f6",
                border: "1px solid rgba(75, 85, 99, 0.3)",
                borderRadius: "12px",
              },
              success: {
                iconTheme: { primary: "#34d399", secondary: "#1f2937" },
              },
              error: {
                iconTheme: { primary: "#f87171", secondary: "#1f2937" },
              },
            }}
          />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
