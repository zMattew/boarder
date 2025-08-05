"use client";
import { AvailableComponents } from "#/core/src/components";
import type { FieldDef } from "pg";
import Chart from "../chart";
import { DataTable } from "../data-table";
import { useComponent } from "./context";

export function BasicComponent({  data, type }: {
    data: Record<string, unknown>[];
    type: FieldDef[];
}) {
    const {component} = useComponent()
    let choosenComponent;
    switch (component.name as AvailableComponents) {
        case "table":
            choosenComponent = (
                <DataTable
                    columns={type.map((t) => {
                        return {
                            accessorKey: t.name,
                            header: t.name[0].toUpperCase() + t.name.slice(1),
                        };
                    })}
                    data={data}
                />
            );
            break;
        case "chart":
            choosenComponent = <Chart type={type} data={data} keys={component.keys} />
            break;
    }
    return choosenComponent
}
