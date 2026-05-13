import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/src/contexts/AuthContext";
import { 
  LayoutDashboard, 
  Briefcase, 
  Settings, 
  LogOut, 
  User, 
  Menu,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "motion/react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { profile, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Projects", path: "/projects", icon: Briefcase },
    { label: "Settings", path: "/settings", icon: Settings },
  ];

  if (profile?.role === "ADMIN") {
    navItems.push({ label: "Admin Panel", path: "/admin", icon: ShieldCheck });
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      <div className="p-8 flex items-center gap-3">
        <div className="bg-[#1a1a1a] p-2 rounded-lg">
          <LayoutDashboard className="w-6 h-6 text-[#FF6321]" />
        </div>
        <span className="text-xl font-bold tracking-tight">ProFlow</span>
      </div>

      <nav className="flex-1 px-4 mt-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link key={item.path} to={item.path} onClick={() => setIsMobileMenuOpen(false)}>
              <span className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive 
                  ? "bg-[#1a1a1a] text-white shadow-lg" 
                : "text-slate-500 hover:bg-slate-100"
              }`}>
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200">
        <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3 mb-4">
          <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
            <AvatarImage src={profile?.photoURL} />
            <AvatarFallback>{profile?.displayName?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{profile?.displayName}</p>
            <p className="text-xs text-slate-500 truncate capitalize">{profile?.role?.toLowerCase()}</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
          onClick={logout}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#f5f5f5] text-slate-900 font-sans overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-50 lg:hidden bg-black/50 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <motion.aside 
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-72 h-full bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent />
          </motion.aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 lg:h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 z-40 shrink-0">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden text-slate-500 rounded-xl"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </Button>
            <h2 className="text-lg font-bold tracking-tight capitalize truncate max-w-[150px] sm:max-w-none">
              {location.pathname.split("/").filter(Boolean)[0] || "Dashboard"}
            </h2>
          </div>
          <div className="flex items-center gap-2 lg:gap-4">
            <Link 
              to="/settings"
              className="flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-full w-9 h-9 lg:w-10 lg:h-10 transition-colors"
            >
              <Settings className="w-5 h-5" />
            </Link>
            <div className="w-px h-6 bg-slate-200 mx-1 lg:mx-2" />
            <div className="lg:hidden">
              <Avatar className="w-8 h-8 rounded-full border border-slate-200">
                <AvatarImage src={profile?.photoURL} />
                <AvatarFallback>{profile?.displayName?.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <section className="flex-1 overflow-y-auto p-4 lg:p-8 relative">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </section>
      </main>
    </div>
  );
}
