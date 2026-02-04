
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="h-screen flex">
      
     
      <Sidebar />

      <div className="flex flex-col flex-1">
        <Navbar />

        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>

    </div>
  );
}
