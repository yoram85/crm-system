import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  DollarSign,
  CheckSquare,
  Package,
  Briefcase,
  FileText,
  Activity,
  Settings,
  Menu,
  X,
  LogOut,
  User as UserIcon,
  Moon,
  Sun,
  Users2,
  TrendingUp,
} from "lucide-react";
import NotificationCenter from "./NotificationCenter";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { isDarkMode, toggleDarkMode } = useThemeStore();

  const handleLogout = async () => {
    console.log("Layout: handleLogout called");

    // Logout from auth
    await logout();

    console.log("Layout: Redirecting to login");
    // Redirect to login page with full reload
    window.location.href = "/login";
  };

  const menuItems = [
    { path: "/", icon: Home, label: "דף הבית" },
    { path: "/customers", icon: Users, label: "לקוחות" },
    { path: "/deals", icon: DollarSign, label: "עסקאות" },
    { path: "/tasks", icon: CheckSquare, label: "משימות" },
    { path: "/products", icon: Package, label: "מוצרים" },
    { path: "/services", icon: Briefcase, label: "שירותים" },
    { path: "/reports", icon: FileText, label: "דוחות" },
    { path: "/activity", icon: Activity, label: "יומן פעילות" },
    { path: "/team", icon: Users2, label: "ניהול צוות" },
    { path: "/team/activity", icon: Activity, label: "פיד פעילות" },
    { path: "/team/performance", icon: TrendingUp, label: "ביצועי צוות" },
    { path: "/settings", icon: Settings, label: "הגדרות" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm fixed top-0 left-0 right-0 z-40 border-b dark:border-gray-700 transition-colors">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">
              מערכת CRM
            </h1>
            <NotificationCenter />
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={isDarkMode ? "מצב בהיר" : "מצב כהה"}
            >
              {isDarkMode ? (
                <Sun size={20} className="text-yellow-500" />
              ) : (
                <Moon size={20} className="text-gray-600" />
              )}
            </button>
          </div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {isSidebarOpen ? (
              <X size={24} className="dark:text-white" />
            ) : (
              <Menu size={24} className="dark:text-white" />
            )}
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed right-0 top-16 bottom-0 w-64 bg-white dark:bg-gray-800 shadow-lg border-l dark:border-gray-700 transform transition-all duration-300 ease-in-out z-30 flex flex-col ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}
      >
        <nav className="p-4 space-y-2 flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-medium"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center">
              <UserIcon className="text-white" size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.role === "admin"
                  ? "מנהל"
                  : user?.role === "manager"
                  ? "מנהל צוות"
                  : user?.role === "sales"
                  ? "מכירות"
                  : user?.role === "support"
                  ? "תמיכה"
                  : "צופה"}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span>התנתק</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="pt-20 pb-6 px-4 lg:pr-64 lg:px-6">{children}</main>
    </div>
  );
};

export default Layout;
