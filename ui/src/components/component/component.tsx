"use client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { fetchData } from "../utils/fetch";

import { ComponentTopBar } from "./top-bar";
import { BasicComponent } from "./basic";
import { useComponent } from "./context";
export function Component() {
    const { component } = useComponent();
    const { data, refetch, isFetching } = useSuspenseQuery({
        queryKey: [component.id],
        queryFn: () => fetchData(component.id),
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        experimental_prefetchInRender: true,
        retry: 3
    });
    return (
        <>
            <ComponentTopBar
                refreshData={refetch}
                refreshing={isFetching}
            />

            <BasicComponent
                data={data.rows}
                type={data.type}
            />
        </>
    );
}
