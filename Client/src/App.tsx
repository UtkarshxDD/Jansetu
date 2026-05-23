import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import MainLayout from './components/MainLayout';
import ProtectedRoute from './ProtectedRoute';
import AdminProtectedRoute from './AdminProtectedRoute';

// Lazy-load all pages for code splitting (faster initial load)
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const Home = lazy(() => import('./pages/Home'));
const MapPage = lazy(() => import('./pages/MapPage'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const DashboardUser = lazy(() => import('./pages/DashboardUser'));
const DashboardOfficer = lazy(() => import('./pages/DashboardOfficer'));
const Officials = lazy(() => import('./pages/Officials'));
const MyTeam = lazy(() => import('./pages/MyTeam'));
const MyComplaints = lazy(() => import('./pages/MyComplaints'));
const Feed = lazy(() => import('./pages/Feed'));
const DisasterFundraising = lazy(() => import('./pages/DisasterFundraising'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));

// Full-page loading spinner
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-500 font-medium">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <MainLayout>
                <Home />
              </MainLayout>
            }
          />

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/aboutus"
            element={
              <MainLayout>
                <AboutUs />
              </MainLayout>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <MainLayout>
                <Leaderboard />
              </MainLayout>
            }
          />

          <Route
            path="/contactUs"
            element={
              <MainLayout>
                <ContactUs />
              </MainLayout>
            }
          />

          <Route
            path="/officials"
            element={
              <MainLayout>
                <Officials />
              </MainLayout>
            }
          />

          <Route
            path="/analytics"
            element={
              <MainLayout>
                <Analytics />
              </MainLayout>
            }
          />

          {/* Protected Routes (require user login) */}
          <Route element={<ProtectedRoute />}>
            <Route
              path="/dashboardUser"
              element={
                <MainLayout>
                  <DashboardUser />
                </MainLayout>
              }
            />
            <Route
              path="/officialsDashboard"
              element={
                <MainLayout>
                  <DashboardOfficer />
                </MainLayout>
              }
            />
            <Route
              path="/map"
              element={
                <MainLayout>
                  <MapPage />
                </MainLayout>
              }
            />
            <Route
              path="/mycomplaints"
              element={
                <MainLayout>
                  <MyComplaints />
                </MainLayout>
              }
            />
            <Route
              path="/feed"
              element={
                <MainLayout>
                  <Feed />
                </MainLayout>
              }
            />
            <Route
              path="/disaster-fundraising"
              element={
                <MainLayout>
                  <DisasterFundraising />
                </MainLayout>
              }
            />
            <Route
              path="/myteam"
              element={
                <MainLayout>
                  <MyTeam />
                </MainLayout>
              }
            />
          </Route>

          {/* Admin Routes — protected separately */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route element={<AdminProtectedRoute />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;