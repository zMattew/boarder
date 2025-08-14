export async function fetchData(componentId: string) {
    const body = new FormData()
    body.set("componentId", componentId)
    try {

        const response = await fetch(`/data`, {
            method: "POST",
            body: body,
            next: {
                tags: [componentId]
            },
            cache: "force-cache"
        })
        if (!response.ok) throw "Error fetching data"
        const data = await response.json()
        return data
    }
    catch (error) {
        console.log(error)
        throw error
    }
}

export async function revalidateData(componentId: string) {
    const body = new FormData()
    body.set("componentId", componentId)
    const response = await fetch(`/data/revalidate`, {
        method: "POST",
        body: body,
        next: {
            tags: [componentId]
        }
    })
    const data = await response.json()
    return data
}