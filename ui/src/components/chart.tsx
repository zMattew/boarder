"use client";
import {
    Area,
    Bar,
    ComposedChart,
    Line,
    Scatter,
    XAxis,
    YAxis,
} from "recharts";
import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "./shadcn/chart";
import { useComponent } from "./component/context";
import type { ColumnDef } from "@tanstack/react-table";

type DataChartProps<TData> = {
    type:  ColumnDef<TData>[];
    data: TData[];
    keys: string[];
};

export default function Chart<TData>({
    data,
    type,
    keys,
}: DataChartProps<TData>) {
    const config = type.filter((t) => keys.find((key) => key == t.header)).reduce(
        (prev, curr) => {
            let val = {};
            if (keys.find((key) => key == curr.header)) {
                val = {
                    ...prev,
                    [curr.header as string]: { label: curr.header, color: "#bc34b3" },
                };
            }
            return val;
        },
        {} as ChartConfig,
    );
    const {style} = useComponent()
    const ChartType = ChartStyle[
        style as "area" | "bar" | "line" | "scatter"
    ] 
    
    return (
        <>
            <ChartContainer
                config={config}
                className="w-full h-full ml-[-20] mt-2 "
            >
                <ComposedChart
                    data={data}
                >
                    <XAxis
                        key={keys[0]}
                        dataKey={keys[0]}
                        tickFormatter={(v) => {
                            const date = new Date(v as string);
                            if (
                                date.toString() != "Invalid Date" && isNaN(v)
                            ) {
                                return date.toLocaleString("en", {
                                    month: "short",
                                    year: "numeric",
                                });
                            }
                            return v;
                        }}
                    />
                    <YAxis
                        key={keys[1]}
                        dataKey={keys[1]}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartType dataKey={keys[1]} fill={"red"} radius={4} />
                </ComposedChart>
            </ChartContainer>
        </>
    );
}

const ChartStyle = {
    area: Area,
    bar: Bar,
    line: Line,
    scatter: Scatter,
};
