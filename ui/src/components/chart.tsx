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
import { Combobox } from "./combobox";

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
                className="w-full h-full  pr-12  mt-2 "
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
            <div className="sticky bottom-0 z-[1] bg-background">
                <div className="flex flex-row my-1">
                    <Combobox
                        options={[
                            { label: "50", value: "50" },
                            { label: "100", value: "100" },
                            { label: "200", value: "200" }
                        ]}
                        placeholder="50"
                        onSelect={(e) => setPagination({ skip: 0, limit: parseInt(e ? e : e = "50") })}
                    />

                    <div className="w-full flex items-center justify-end gap-2 ">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPagination({ skip: pagination.skip + pagination.limit, limit: pagination.limit })}
                            disabled={data.rows.length == 0}
                        >
                            <ArrowLeft size={8} />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPagination({ skip: pagination.skip - pagination.limit, limit: pagination.limit })}
                            disabled={pagination.skip == 0}
                        >
                            <ArrowRight size={8} />
                        </Button>
                        
                    </div>
                </div>
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
