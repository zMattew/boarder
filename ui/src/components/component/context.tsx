"use client";
import type { getUserProject } from "@/lib/project";
import {
    createContext,
    ReactNode,
    use,
    useLayoutEffect,
    useState,
} from "react";

const componentContext = createContext<
    {
        component: Awaited<
            ReturnType<typeof getUserProject>
        >[number]["view"][number]["components"][number];
        size: { w: number; h: number };
        setSize: (size: { w: number; h: number }) => void;
        position: { x: number; y: number };
        setPosition: (cord: { x: number; y: number }) => void;
        style: string;
        setStyle: (v: string) => void;
        locked: boolean;
        setLocked: (v: boolean) => void;
        restore: ()=>void
    }
>({
    component: {
        id: "null",
        description: "null",
        keys: [],
        name: "null",
        query: "null",
        source: { id: "null",name:"null" },
        viewId: "null",
        meta: {},
    },
    size: { h: 0, w: 0 },
    setSize: () => {},
    position: { x: 0, y: 0 },
    setPosition: () => {},
    style: "bar",
    setStyle: () => {},
    locked: false,
    setLocked: () => {},
    restore: ()=>{}
});

export function ComponentProvider(
    { component, children }: {
        component: Required<
            Awaited<
                ReturnType<typeof getUserProject>
            >[number]["view"][number]["components"][number]
        >;
        children: ReactNode;
    },
) {
    const [initState] = useState({...component?.meta as {
        w?: number;
        h?: number;
        x?: number;
        y?: number;
        style?: string;
    }})
    const [locked, setLocked] = useState(false);
    const [size, setSize] = useState<{ w: number; h: number }>({
        w: initState?.w ?? 300,
        h: initState?.h ?? 200,
    });
    const [position, setPosition] = useState<{ x: number; y: number }>({
        x: initState?.x ?? 150,
        y: initState?.y ?? 100,
    });
    const [style, setStyle] = useState<string>(
        initState?.style ?? "bar",
    );

    const setLockedLocal = (value: boolean) => {
        setLocked(value);
        localStorage.setItem(
            `${component.viewId}-${component.id}-locked`,
            value.toString(),
        );
    };

    const setStyleLocal = (value: string) => {
        setStyle(value);
        localStorage.setItem(
            `${component.viewId}-${component.id}-style`,
            value,
        );
        component.meta = {...component.meta as Record<string,unknown>,style:value}
    };

    const setPosLocal = (cord: { x: number; y: number }) => {
        setPosition(cord);
        localStorage.setItem(
            `${component.viewId}-${component.id}-cord`,
            JSON.stringify(cord),
        );
        component.meta = {...component.meta as Record<string,unknown>,...cord}
    };

    const setSizeLocal = (dim: { w: number; h: number }) => {
        setSize(dim);
        localStorage.setItem(
            `${component.viewId}-${component.id}-size`,
            JSON.stringify(dim),
        );
        component.meta = {...component.meta as Record<string,unknown>,...dim}
    };
    const restoreComponent = ()=>{
        console.log(initState)
        setPosition({x:initState.x ?? 0,y:initState.y ?? 0})
        localStorage.removeItem(`${component.viewId}-${component.id}-cord`)
        setSize({w:initState.w ?? 0,h:initState.h ?? 0})
        localStorage.removeItem(`${component.viewId}-${component.id}-size`)

    }

    useLayoutEffect(() => {
        const chartStyle = localStorage.getItem(
            `${component.viewId}-${component.id}-style`,
        );
        if (chartStyle) {
            setStyle(chartStyle as "area" | "bar" | "line" | "scatter");
        }
        const cord = localStorage.getItem(
            `${component.viewId}-${component.id}-cord`,
        );
        if (cord) {
            const parsedCord = JSON.parse(cord)
            setPosition(parsedCord);
        }
        const dim = localStorage.getItem(
            `${component.viewId}-${component.id}-dim`,
        );
        if (dim) {
            const parsedDim = JSON.parse(dim)
            setSize(parsedDim);

        }
        const locked = localStorage.getItem(
            `${component.viewId}-${component.id}-locked`,
        );
        if (locked) {
            setLocked(locked == "true" ? true : false);
        }
        return () => {};
    }, [component]);

    return (
        <componentContext.Provider
            value={{
                component,
                position,
                setPosition: setPosLocal,
                size,
                setSize: setSizeLocal,
                style,
                setStyle: setStyleLocal,
                locked,
                setLocked: setLockedLocal,
                restore:restoreComponent
            }}
        >
            {children}
        </componentContext.Provider>
    );
}

export function useComponent() {
    const ctx = use(componentContext);
    return ctx;
}
