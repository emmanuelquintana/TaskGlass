import { Outlet } from "react-router-dom";
import { Topbar } from "./Topbar";
import { Sidebar } from "./Sidebar";
import { AnimatedBackdrop } from "../../shared/liquid/AnimatedBackdrop";
import { LiquidGlassLayer } from "../../shared/liquid/LiquidGlassLayer";
import { LiquidGlassDefs } from "../ui/LiquidGlassDefs";

export function ShellLayout() {
    return (
        <div className="h-full w-full">
            {/* Fondo animado + vidrio WebGL */}
            <AnimatedBackdrop fps={30} scale={0.6} />
            <LiquidGlassLayer />
            <LiquidGlassDefs />

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
