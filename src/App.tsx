import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext.tsx';
import Layout from './components/Layout.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Hours from './pages/Hours.tsx';
import VisitsMap from './pages/Map.tsx';
import Schedule from './pages/Schedule.tsx';
import Profile from './pages/Profile.tsx';
import Login from './pages/Login.tsx';
import TreePet from './pages/TreePet.tsx';
import { motion, AnimatePresence } from 'framer-motion';

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
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default App;
