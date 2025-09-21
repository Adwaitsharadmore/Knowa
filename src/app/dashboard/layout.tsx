import type React from "react";
import sidebar from "@/components/layout/sidebar";
import header from "@/components/layout/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background">
      <sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
