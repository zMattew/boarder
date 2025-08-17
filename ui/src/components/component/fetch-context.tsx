"use client"
import { createContext, ReactNode, use, useState } from "react";
import { fetchData } from "../utils/fetch";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";

const fetchContext = createContext({
    id: "",
    data: { rows: [{}], type: [{ header: "",accessorKey:"" }] },
    pagination: { skip: 0, limit: 25 },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setPagination: ({ skip, limit }: { skip: number; limit: number; }) => { },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    refetch: async (options?: RefetchOptions) => ({} as Promise<QueryObserverResult<unknown, Error>>),
    isFetching: false
})

export function FetcherProvider({ id, children }: { id: string, children: ReactNode }) {
    const [pagination, setPagination] = useState({
        skip: 0,
        limit: 50
    })
    const { data, refetch, isFetching } = useSuspenseQuery({
        queryKey: [id, pagination.skip, pagination.limit],
        queryFn: () => fetchData(id, pagination.skip, pagination.limit),
        refetchOnWindowFocus: false,
        refetchOnMount:false,
        staleTime:10000,
        experimental_prefetchInRender: true,
        retry: 3
    });
    return <fetchContext.Provider value={{
        id, pagination, setPagination, data: {
            rows: data.rows, type: data.type.map((t) => {
                return {
                    accessorKey: t.name,
                    header: t.name[0].toUpperCase() + t.name.slice(1),
                };
            })
        }, refetch, isFetching
    }}>
        {children}
    </fetchContext.Provider>
}

export function useFetcher() {
    const ctx = use(fetchContext)
    return ctx
}