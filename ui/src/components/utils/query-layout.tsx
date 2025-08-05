"use client";
import {
    isServer,
    QueryClient,
    QueryClientProvider,
} from "@tanstack/react-query";
export function QueryProvider({ children }: { children: React.ReactNode }) {
    const client = getQueryClient();

    return (
        <QueryClientProvider client={client}>
                {children}
        </QueryClientProvider>
    );
}
let browserQueryClient: QueryClient | undefined = undefined;
function getQueryClient() {
    if (isServer) {
        return new QueryClient();
    } else {
        if (!browserQueryClient) browserQueryClient = new QueryClient();
        return browserQueryClient;
    }
}
