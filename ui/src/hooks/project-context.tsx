"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createContext,
    ReactNode,
    use,
    useLayoutEffect,
    useState,
} from "react";
import { getUserProject } from "../lib/project";

const projectContext = createContext<
    {
        currentProject?: Awaited<ReturnType<typeof getUserProject>>[number];
        setProject: (
            project: Awaited<ReturnType<typeof getUserProject>>[number],
        ) => void;
        projects?: Awaited<ReturnType<typeof getUserProject>>;
        refreshProjects: () => Promise<void>;
    }
>({ projects: [], setProject: () => {}, refreshProjects: async () => {} });

export function ProjectProvider({ children }: { children: ReactNode }) {
    const client = useQueryClient();
    const { data: projects } = useQuery({
        queryKey: [`projects`],
        queryFn: getUserProject,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
    });
    const [currentProject, setProject] = useState<
        Awaited<ReturnType<typeof getUserProject>>[number]
    >();
    const refreshProject = async () => {
        await client.invalidateQueries({
            queryKey: [`projects`],
        });
    };
    const setProjectPersist = (
        project: Awaited<ReturnType<typeof getUserProject>>[number],
    ) => {
        setProject(project);
        localStorage.setItem(
            `selected-project`,
            project.id,
        );
    };
    useLayoutEffect(() => {
        const lastSelected = localStorage.getItem(
            `selected-project`,
        );
        if (lastSelected) {
            setProject(projects?.find((p) => p.id == lastSelected));
        }
    }, [projects]);

    return (
        <projectContext.Provider
            value={{
                projects,
                currentProject,
                setProject: setProjectPersist,
                refreshProjects: refreshProject,
            }}
        >
            {children}
        </projectContext.Provider>
    );
}

export function useProject() {
    const ctx = use(projectContext);
    return ctx;
}
