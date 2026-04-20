import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ForbiddenBoundary } from "@/components/Common/ForbiddenBoundary";
import Navbar from "@/components/Common/Navbar";
import AppSidebar from "@/components/Common/NavSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Disclaimer } from "@/components/Common/Disclaimer";

export const Route = createFileRoute("/_layout")({
  component: Layout,
});

function Layout() {
  const [disclaimerVisible, setDisclaimerVisible] = useState<boolean>(() => {
    return localStorage.getItem("disclaimer-hidden") !== "true";
  });

  useEffect(() => {
    localStorage.setItem(
      "disclaimer-hidden",
      disclaimerVisible ? "false" : "true",
    );
  }, [disclaimerVisible]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Navbar />
        <div className="flex flex-col flex-1 p-5 overflow-auto">
          <ForbiddenBoundary>
            <Outlet />
          </ForbiddenBoundary>
        </div>
        <footer className="shrink-0 border-t border-border">
          <Disclaimer
            isVisible={disclaimerVisible}
            setVisible={setDisclaimerVisible}
          />
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default Layout;
