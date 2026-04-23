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
    const hidden = localStorage.getItem("disclaimer-hidden") === "true";
    const hiddenAt = localStorage.getItem("disclaimer-hidden-at");

    if (!hidden) return true;

    if (!hiddenAt) return true;

    const TWO_WEEKS = 14 * 24 * 60 * 60 * 1000;
    const isExpired = Date.now() - Number(hiddenAt) > TWO_WEEKS;

    return isExpired;
  });

  useEffect(() => {
    if (disclaimerVisible) {
      localStorage.setItem("disclaimer-hidden", "false");
      localStorage.removeItem("disclaimer-hidden-at");
    } else {
      localStorage.setItem("disclaimer-hidden", "true");
      localStorage.setItem("disclaimer-hidden-at", Date.now().toString());
    }
  }, [disclaimerVisible]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Navbar onShowDisclaimer={() => setDisclaimerVisible(true)} />
        <Disclaimer
          isVisible={disclaimerVisible}
          setVisible={setDisclaimerVisible}
        />
        <div className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto md:p-5">
          <ForbiddenBoundary>
            <Outlet />
          </ForbiddenBoundary>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default Layout;
