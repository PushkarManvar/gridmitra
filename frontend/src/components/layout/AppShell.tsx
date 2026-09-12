import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function AppShell() {
  return (
    <div className="flex min-h-screen relative bg-surface-container-lowest text-on-surface antialiased overflow-x-hidden">
      <Sidebar />
      <TopBar />
      <div className="flex-1 pl-60 pt-14 flex flex-col min-h-screen">
        <Outlet />
      </div>
    </div>
  );
}
