import type { BuiltInProviders, Provider } from "next-auth/providers";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
export function getOAuthProvidersFromEnv() {
    const availableProviders: {
        [key in keyof BuiltInProviders]?: Provider;
    } = { "google": Google, "github": GitHub };
    const envProviders = Object.keys(process.env).filter((providerName) => providerName.startsWith("AUTH"));
    const thirdPartyProvider = Object.groupBy(envProviders, (e) => {
        const start = e.split("_")[1].toLowerCase();
        const matchedProvider = availableProviders[start as keyof BuiltInProviders];
        if (!matchedProvider) return "unavalilable";
        return start;
    });
    const configuredProvider = Object.entries(thirdPartyProvider)
        .filter(([, v]) => {
            const id = v?.find((envName) => envName.endsWith("ID"));
            const secret = v?.find((envName) => envName.endsWith("SECRET"));
            return (!!id && !!secret);
        })
        .map((v) => (v[0]));
    const availableEnvProviders = configuredProvider
        .map((v) => availableProviders[v as keyof BuiltInProviders]!);
    return availableEnvProviders;
}


export const oAuthProviderMap =()=> getOAuthProvidersFromEnv()
    .map((provider) => {
        if (typeof provider === "function") {
            const providerData = provider()
            return { id: providerData.id, name: providerData.name }
        } else {
            return { id: provider.id, name: provider.name }
        }
    })