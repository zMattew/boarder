"use client";
import { ComponentTopBar } from "./top-bar";
import { BasicComponent } from "./basic";
import { useFetcher } from "./fetch-context";
export function Component() {
    const { isFetching, refetch } = useFetcher()
    return (
        <>
            <ComponentTopBar
                refreshData={refetch}
                refreshing={isFetching}
            />
            <BasicComponent />
        </>
    );
}
