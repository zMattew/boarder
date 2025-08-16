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
import { useFetcher } from "./component/fetch-context";
import { Button } from "./shadcn/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function Chart() {
    const { component } = useComponent()
    const { data, pagination, setPagination } = useFetcher()

    const config = data.type.filter((t) => component.keys.find((key) => key == t.header)).reduce(
        (prev, curr) => {
            let val = {};
            if (component.keys.find((key) => key == curr.header)) {
                val = {
                    ...prev,
                    [curr.header as string]: { label: curr.header, color: "#bc34b3" },
                };
            }
            return val;
        },
        {} as ChartConfig,
    );
    const { style } = useComponent()
    const ChartType = ChartStyle[
        style as "area" | "bar" | "line" | "scatter"
    ]

    return (
        <>
            <ChartContainer
                config={config}
                className="w-full h-full  pr-12 pl-1  mt-2 "
            >
                <ComposedChart
                    data={data.rows}
                >
                    <XAxis
                        key={component.keys[0]}
                        dataKey={component.keys[0]}
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
                        key={component.keys[1]}
                        dataKey={component.keys[1]}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartType dataKey={component.keys[1]} fill={"red"} radius={4} />
                </ComposedChart>
            </ChartContainer>
            <div className="absolute bottom-0 w-full flex items-center justify-between gap-2 px-1  ">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination({ skip: pagination.skip + pagination.limit, limit: pagination.limit })}
                    disabled={data.rows.length == 0}
                    
                >
                    <ArrowLeft size={8}  />
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination({ skip: pagination.skip - pagination.limit, limit: pagination.limit })}
                    disabled={pagination.skip == 0}
                >
                    <ArrowRight />
                </Button>
            </div>
        </>
    );
}

const ChartStyle = {
    area: Area,
    bar: Bar,
    line: Line,
    scatter: Scatter,
};
