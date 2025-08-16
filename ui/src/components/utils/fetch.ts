export async function fetchData(componentId: string,skip:number,limit:number) {
    const body = new FormData()
    body.set("componentId", componentId)
    body.set("skip",skip.toString())
    body.set("limit",limit.toString())
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
        return data as {rows:Record<string,unknown>[],type:{name:string}[]}
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