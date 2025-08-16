"use client";
import { AvailableComponents } from "@repo/core/components";
import Chart from "../chart";
import { DataTable } from "../data-table";
import { useComponent } from "./context";
import { useFetcher } from "./fetch-context";

export function BasicComponent() {
    const { data } = useFetcher()
    const { component } = useComponent()
    let choosenComponent;
    switch (component.name as AvailableComponents) {
        case "table":
            choosenComponent = (
                <DataTable />
            );
            break;
        case "chart":
            choosenComponent = <Chart type={data.type} data={data.rows} keys={component.keys} />
            break;
    }
    return choosenComponent
}
