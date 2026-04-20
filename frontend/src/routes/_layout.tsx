import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ForbiddenBoundary } from "@/components/Common/ForbiddenBoundary";
import Navbar from "@/components/Common/Navbar";
import AppSidebar from "@/components/Common/NavSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export const Route = createFileRoute("/_layout")({
  component: Layout,
});

function Layout() {
  const [disclaimerVisible, setDisclaimerVisible] = useState(() => {
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
          {disclaimerVisible ? (
            <div className="flex items-start gap-4 px-5 py-4">
              <p className="flex-1 text-xs leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground">
                  Disclaimer:{" "}
                </span>
                This database contains curated data from cited references for
                research and educational purposes. It is intended as a
                preliminary engineering resource and does not replace
                project-specific design, codes, or manufacturer documentation.
                Use is at your own discretion, provided "as is", and the authors
                are not liable for any outcomes. Users should verify information
                with original sources.
              </p>
              <button
                type="button"
                onClick={() => setDisclaimerVisible(false)}
                className="shrink-0 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
              >
                Hide
              </button>
            </div>
          ) : (
            <div className="flex justify-end px-5 py-2">
              <button
                type="button"
                onClick={() => setDisclaimerVisible(true)}
                className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
              >
                Show disclaimer
              </button>
            </div>
          )}
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default Layout;
