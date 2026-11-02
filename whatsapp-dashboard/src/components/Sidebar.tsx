"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MessageSquare, Settings, Webhook, BotMessageSquare, Menu, X, Users, LogOut } from "lucide-react";
import { useState } from "react";
import { logout } from "@/app/login/actions";

interface SidebarProps {
  userRole?: string;
}

export function Sidebar({ userRole = "MEMBRO" }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  let links = [
    { href: "/", label: "Dashboard Global", icon: LayoutDashboard },
    { href: "/prompts", label: "Agentes & WhatsApp", icon: MessageSquare },
    { href: "/chat", label: "Live Chat Monitor", icon: Webhook },
    { href: "/team", label: userRole === "SUPER_ADMIN" ? "Gerenciar Tenants" : "Gerenciar Equipe", icon: Users },
    { href: "/settings", label: "Configurações", icon: Settings },
  ];

  // Filter links based on role
  if (userRole === "MEMBRO") {
    links = links.filter(link => link.href !== "/prompts" && link.href !== "/team");
  }

  return (
    <>
      {/* Top bar for mobile */}
      <div className="md:hidden flex items-center justify-between bg-indigo-700 text-white p-4 shadow-md z-20">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
            <BotMessageSquare className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none tracking-tight">Ecosystem AI</h1>
            <p className="text-[10px] text-indigo-200">WhatsApp Manager</p>
          </div>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="p-1 hover:bg-white/10 rounded-md transition-colors">
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Overlay background for mobile drawer */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-30 transition-opacity" 
          onClick={() => setIsOpen(false)} 
        />
      )}

      {/* Sidebar Navigation */}
      <aside 
        className={`fixed md:static inset-y-0 left-0 transform ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 transition-transform duration-300 w-72 bg-gradient-to-b from-indigo-600 via-purple-600 to-indigo-900 text-white flex flex-col shadow-2xl z-40`}
      >
        {/* Desktop Header */}
        <div className="h-20 hidden md:flex items-center gap-3 px-6 border-b border-white/10">
          <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
            <BotMessageSquare className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight leading-tight">Ecosystem AI</h1>
            <p className="text-xs text-indigo-200">WhatsApp Manager</p>
          </div>
        </div>
        
        {/* Mobile Sidebar Header */}
        <div className="h-20 md:hidden flex items-center justify-between px-6 border-b border-white/10">
          <div className="flex items-center gap-3">
             <BotMessageSquare className="h-7 w-7 text-white" />
             <h1 className="font-bold text-xl tracking-tight">Menu</h1>
          </div>
          <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded-md">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Links */}
        <nav className="flex-1 overflow-auto py-6 px-4 space-y-2">
          {links.map((link) => {
            const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== '/');
            const Icon = link.icon;
            return (
              <Link 
                key={link.href} 
                href={link.href} 
                onClick={() => setIsOpen(false)} // close mobile menu on click
                className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                  isActive 
                    ? "bg-white/10 text-white font-semibold shadow-sm border border-white/5" 
                    : "text-white/80 hover:text-white hover:bg-white/10 hover:shadow-sm"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
        
        {/* Footer */}
        <div className="p-4 border-t border-white/10 text-center">
          <form action={logout}>
            <button type="submit" className="flex items-center justify-center gap-2 w-full px-4 py-2 mb-3 rounded-lg bg-red-500/20 text-red-200 hover:bg-red-500/40 hover:text-white transition-colors cursor-pointer">
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Sair da Conta</span>
            </button>
          </form>
          <p className="text-xs text-white/50">Sistema rodando em Docker</p>
          <p className="text-xs text-white/50 font-semibold mt-1">Status: Online</p>
        </div>
      </aside>
    </>
  );
}
