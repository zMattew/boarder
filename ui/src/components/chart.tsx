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
import type { FieldDef } from "pg";
import { useComponent } from "./component/context";

type DataChartProps<TData> = {
    type: FieldDef[];
    data: TData[];
    keys: string[];
};

export default function Chart<TData>({
    data,
    type,
    keys,
}: DataChartProps<TData>) {
    const config = type.filter((t) => keys.find((key) => key == t.name)).reduce(
        (prev, curr) => {
            let val = {};
            if (keys.find((key) => key == curr.name)) {
                val = {
                    ...prev,
                    [curr.name]: { label: curr.name, color: "#bc34b3" },
                };
            }
            return val;
        },
        {} as ChartConfig,
    );
    const {style} = useComponent()
    const ChartType = ChartStyle[
        style as "area" | "bar" | "line" | "scatter"
    ] as React.ComponentType<
        | typeof Area.defaultProps
        | typeof Bar.defaultProps
        | typeof Line.defaultProps
        | typeof Scatter.defaultProps
    >;
    
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
