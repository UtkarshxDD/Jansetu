import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AboutUs from './pages/AboutUs';
import Home from './pages/Home';
import MapPage from './pages/MapPage';
import ContactUs from './pages/ContactUs';
import DashboardUser from './pages/DashboardUser';
import DashboardOfficer from './pages/DashboardOfficer';
import Officials from './pages/Officials';
import MyTeam from './pages/MyTeam';
import MyComplaints from './pages/MyComplaints';
import Feed from './pages/Feed';
import DisasterFundraising from './pages/DisasterFundraising';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './ProtectedRoute';


function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <MainLayout>
              <Home />
            </MainLayout>
          }
        />

        <Route
          path="/login"
          element={<Login />}
        />

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
          path="/contactUs"
          element={
            <MainLayout>
              <ContactUs />
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

        <Route
          path="/officials"
          element={
            <MainLayout>
              <Officials />
            </MainLayout>
          }
        />



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
      </Route>

      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />


      </Routes>
    </Router>
  );
}

export default App;