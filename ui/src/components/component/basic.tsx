"use client";
import { AvailableComponents } from "@repo/core/components";
import Chart from "../chart";
import { DataTable } from "../data-table";
import { useComponent } from "./context";

export function BasicComponent() {
    const { component } = useComponent()
    let choosenComponent;
    switch (component.name as AvailableComponents) {
        case "table":
            choosenComponent = (
                <DataTable />
            );
            break;
        case "chart":
            choosenComponent = <Chart />
            break;
    }
    return choosenComponent
}
