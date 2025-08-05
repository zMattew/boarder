export type AvailableComponents = "table" | "chart"

type TComponent = {
    name: AvailableComponents,
    requiredKeysDescription?: string[]
}

const Components: TComponent[] = [
    {
        name: "table",
    },
    {
        name: "chart",
        requiredKeysDescription: ["field for x axis (usually Date type)", "field for y axsis (usually a number type)"]
    }
]

export default Components