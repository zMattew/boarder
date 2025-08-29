"use client";
import {
    createContext,
    ReactNode,
    use,
    useLayoutEffect,
    useState,
} from "react";
import { getUserProject } from "../lib/project";
import { useProject } from "./project-context";
import { usePathname } from "next/navigation";

const viewContext = createContext<
    {
        currentView?: Awaited<
            ReturnType<typeof getUserProject>
        >[number]["view"][number];
        setView: (
            projectId?: Awaited<
                ReturnType<typeof getUserProject>
            >[number]["view"][number],
        ) => void;
        views: Awaited<ReturnType<typeof getUserProject>>[number]["view"];
        refreshViews: () => Promise<void>;
    }
>({ views: [], setView: () => {}, refreshViews: async() => {} });

export function ViewProvider({ children }: { children: ReactNode }) {
    const { currentProject, refreshProjects: refreshProject } = useProject();
    const path = usePathname();
    const [currentView, setView] = useState<
        Awaited<ReturnType<typeof getUserProject>>[number]["view"][number]
    >();
    const pathViewId = path.slice(path.lastIndexOf("/") + 1, path.length);
    const viewFromPath = currentProject?.view.find((v) => pathViewId == v.id);
    useLayoutEffect(() => {
        if (path.startsWith("/home/views/") && viewFromPath) {
            setView(viewFromPath);
        }
    }, [viewFromPath, currentProject, path]);

    return (
        <viewContext.Provider
            value={{
                views: currentProject?.view ?? [],
                currentView,
                setView,
                refreshViews: refreshProject,
            }}
        >
            {children}
        </viewContext.Provider>
    );
}

export function useView() {
    const ctx = use(viewContext);
    return ctx;
}
