import { Link, useLocation } from "react-router-dom";
import { Home } from "lucide-react";
import { useWorkspaces } from "../../api/workspace.api";
import { LiquidSurface } from "../ui/LiquidSurface";

export function Sidebar() {
    const { data, isLoading, error } = useWorkspaces();
    const loc = useLocation();

    return (
        <aside className="w-[280px] shrink-0 p-4">
            <div className="space-y-3">
                <LiquidSurface className="p-4 rounded-2xl">
                    <div className="text-sm font-semibold">Workspaces</div>
                    <div className="text-xs tg-muted">Selecciona uno para ver el board</div>
                </LiquidSurface>

                <Link to="/" aria-current={loc.pathname === "/" ? "page" : undefined} className="block">
                    <LiquidSurface className="p-4 rounded-2xl flex items-center gap-3" interactive strong={loc.pathname === "/"}>
                        <Home size={20} />
                        <div className="text-sm font-semibold">Home</div>
                    </LiquidSurface>
                </Link>

                {isLoading && <LiquidSurface className="p-4 rounded-2xl" interactive> Cargando… </LiquidSurface>}
                {error && <LiquidSurface className="p-4 rounded-2xl" interactive> Error cargando workspaces </LiquidSurface>}

                {data?.map((w) => {
                    const href = `/w/${w.id}/board`;
                    const active = loc.pathname.startsWith(href);

                    return (
                        <Link key={w.id} to={href} aria-current={active ? "page" : undefined} className="block">
                            <LiquidSurface className="p-4 rounded-2xl" interactive strong={active}>
                                <div className="text-sm font-semibold">{w.name}</div>
                                <div className="text-xs tg-muted">{w.code}</div>
                            </LiquidSurface>
                        </Link>
                    );
                })}
            </div>
        </aside>
    );
}
