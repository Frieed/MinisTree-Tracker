import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext.tsx';
import Layout from './components/Layout.tsx';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = lazy(() => import('./pages/Dashboard.tsx'));
const Hours = lazy(() => import('./pages/Hours.tsx'));
const VisitsMap = lazy(() => import('./pages/Map.tsx'));
const Schedule = lazy(() => import('./pages/Schedule.tsx'));
const Profile = lazy(() => import('./pages/Profile.tsx'));
const Login = lazy(() => import('./pages/Login.tsx'));
const TreePet = lazy(() => import('./pages/TreePet.tsx'));

const LoadingSpinner = () => (
  <div className="min-h-screen bg-nature-cream flex items-center justify-center">
    <div className="w-12 h-12 border-4 border-nature-green/20 border-t-nature-green rounded-full animate-spin" />
  </div>
);

function App() {
  const { user, loading } = useAuth();
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <motion.div 
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="min-h-screen bg-nature-cream flex items-center justify-center"
        >
          <div className="w-12 h-12 border-4 border-nature-green/20 border-t-nature-green rounded-full animate-spin" />
        </motion.div>
      ) : !user ? (
        <motion.div 
          key="login"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Login />
        </motion.div>
      ) : (
        <motion.div
          key="app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="h-full w-full"
        >
          <Suspense fallback={<LoadingSpinner />}>
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="hours" element={<Hours />} />
                <Route path="schedule" element={<Schedule />} />
                <Route path="map" element={<VisitsMap />} />
                <Route path="tree" element={<TreePet />} />
                <Route path="settings" element={<Profile />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default App;
