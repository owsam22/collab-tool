import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Notifications from './components/Notifications';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MeetingRoom from './pages/MeetingRoom';
import Profile from './pages/Profile';
import Teams from './pages/Teams';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <Navbar />
          <Notifications />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={
              <PrivateRoute><Dashboard /></PrivateRoute>
            } />
            <Route path="/meeting/:roomId" element={
              <PrivateRoute><MeetingRoom /></PrivateRoute>
            } />
            <Route path="/profile" element={
              <PrivateRoute><Profile /></PrivateRoute>
            } />
            <Route path="/teams" element={
              <PrivateRoute><Teams /></PrivateRoute>
            } />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
