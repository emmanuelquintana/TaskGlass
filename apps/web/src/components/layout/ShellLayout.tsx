import { Outlet } from "react-router-dom";
import { Topbar } from "./Topbar";
import { Sidebar } from "./Sidebar";
import { AppBackground } from "../../shared/backgrounds/AppBackground";
import { LiquidGlassLayer } from "../../shared/liquid/LiquidGlassLayer";

export function ShellLayout() {
    return (
        <div className="h-full w-full">
            {/* Fondo configurable + vidrio WebGL */}
            <AppBackground />
            <LiquidGlassLayer />

            {/* UI */}
            <div className="h-full w-full p-4 flex gap-4">
                <Sidebar />

                <div className="flex-1 min-w-0 flex flex-col gap-4">
                    <Topbar />

                    <main className="flex-1 min-w-0 overflow-auto">
                        <div className="p-1">
                            <Outlet />
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
