import { Outlet } from "react-router-dom";
import { Topbar } from "./Topbar";
import { Sidebar } from "./Sidebar";
import { AppBackground } from "../../shared/backgrounds/AppBackground";
import { LiquidGlassLayer } from "../../shared/liquid/LiquidGlassLayer";
import { LiquidScrollArea } from "../ui/LiquidScrollArea";
import { GlobalLoading } from "../ui/GlobalLoading";

export function ShellLayout() {
    return (
        <div className="h-full w-full">
            {/* Fondo configurable + vidrio WebGL */}
            <AppBackground />
            <LiquidGlassLayer />
            <GlobalLoading />

            {/* UI */}
            <div className="h-full w-full p-4 flex gap-4">
                <Sidebar />

                <div className="flex-1 min-w-0 flex flex-col gap-4">
                    <Topbar />

                    <main className="flex-1 min-w-0 overflow-hidden relative">
                        <LiquidScrollArea className="h-full">
                            <div className="p-1 h-full">
                                <Outlet />
                            </div>
                        </LiquidScrollArea>
                    </main>
                </div>
            </div>
        </div>
    );
}
