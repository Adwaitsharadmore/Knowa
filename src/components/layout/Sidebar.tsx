"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Bot,
  FileText,
  MessageSquare,
  Settings,
  Users,
  BarChart3,
  Upload,
  Database,
  Shield,
  ChevronLeft,
  ChevronRight,
  Building2,
} from "lucide-react"

interface SidebarProps {
  className?: string
}

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: BarChart3,
    badge: null,
  },
  {
    name: "Slack Integration",
    href: "/integrations/slack",
    icon: MessageSquare,
    badge: null,
  },
  {
    name: "Organization Form",
    href: "/organization",
    icon: Building2,
    badge: null,
  },
  // {
  //   name: "Knowledge Base",
  //   href: "/knowledge/manage",
  //   icon: Database,
  //   badge: null,
  // },
  // {
  //   name: "Upload Documents",
  //   href: "/knowledge/upload",
  //   icon: Upload,
  //   badge: null,
  // },
  // {
  //   name: "Document Sources",
  //   href: "/knowledge/sources",
  //   icon: FileText,
  //   badge: null,
  // },
  // {
  //   name: "User Management",
  //   href: "/admin/users",
  //   icon: Users,
  //   badge: null,
  // },
  // {
  //   name: "Settings",
  //   href: "/admin/settings",
  //   icon: Settings,
  //   badge: null,
  // },
  // {
  //   name: "Security",
  //   href: "/admin/security",
  //   icon: Shield,
  //   badge: "Pro",
  // },
]

const Sidebar = ({ className }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <div
      className={cn(
        "flex flex-col border-r bg-background transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        className,
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <Bot className="h-6 w-6 text-primary" />
            <span className="font-semibold">Knowledge Copilot</span>
          </div>
        )}
        <Button variant="ghost" size="sm" onClick={() => setCollapsed(!collapsed)} className="h-8 w-8 p-0">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                )}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1">{item.name}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        {!collapsed && (
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Status</span>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                Online
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Version</span>
              <span>v1.0.0</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
export default Sidebar;
