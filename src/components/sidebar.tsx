import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar, LayoutDashboard, Users, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isOpen, setIsOpen] = useState(false); 
  const location = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Schedule Interview", href: "/new", icon: Calendar },
    { name: "Interviewers", href: "/interviewers", icon: Users },
  ];

  return (
    <div className={`${className} min-h-screen border-r`}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-white shadow-md"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      <div
        className={cn(
          " bg-background transition-all duration-300 lg:min-h-screen",
          collapsed ? "w-16" : "w-64",
          "fixed bottom-0 left-0 z-40 border-t lg:relative lg:border-t-0",
          isOpen ? "w-64 left-0 top-0 h-full bg-white shadow-lg" : "hidden",
          "lg:block"
        )}
      >
        <div className="flex h-16 items-center justify-between px-4">
          {!collapsed && (
            <h2
              className={cn(
                "text-lg font-semibold",
                isOpen && "text-base ml-16"
              )}
            >
              Interview Scheduler
            </h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className={cn("hidden lg:flex", collapsed && "mx-auto -ml-3")}
          >
            {collapsed ? (
              <Menu className="h-4 w-4" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </Button>
        </div>
        <nav className="flex flex-col space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center space-x-2 px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-secondary text-secondary-foreground"
                    : "hover:bg-secondary/50",
                  collapsed ? "justify-center lg:flex-1" : "flex-1",
                  "lg:justify-start"
                )}
                onClick={() => setIsOpen(false)}
              >
                <item.icon className="h-4 w-4" />
                {(!collapsed || isOpen) && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* overlay for mobile screen */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
