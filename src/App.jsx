import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home/Home';
import NotFound from './pages/NotFound';
import Search from './pages/search/Search';
import Manage from './pages/manage/Manage';
import Login from './pages/login/Login';
import Settings from './pages/settings/Settings';
import Account from './pages/settings/Account';
import AccountManagement from './pages/settings/AccountManagement';
import DepartmentManagement from './pages/settings/DepartmentManagement';
import ProtectedAdminRoute from './auth/protectedAdminRoute';
import ProtectedSuperAdminRoute from './auth/protectedSuperAdminRoute';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/search" element={<Search />} />
        <Route path="/manage" element={<Manage />} />

        <Route path="/settings" element={<Settings />}>
          <Route path="account" element={<Account />} />
          <Route
            path="management"
            element={
              <ProtectedAdminRoute>
                <AccountManagement />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="department"
            element={
            <ProtectedSuperAdminRoute>
              <DepartmentManagement />
            </ProtectedSuperAdminRoute>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
