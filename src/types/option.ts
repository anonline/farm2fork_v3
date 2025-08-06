

export enum OptionsEnum {
    HomeHeroBgImage             = "home_heroBg",
    HomeHeroOverlay             = "home_heroOverlay",
    HomeHeroTitle               = "home_heroTitle",
    HomeHeroPrimaryBtnText      = "home_heroPrimaryButtonText",
    HomeHeroSecondaryBtnText    = "home_heroSecondaryButtonText",
    HomeHeroMinHeight           = "home_heroMinHeight",

    //API Keys
    BillingoV3ApiKey            = "billingo_v3_api_key"
}

export type Option<T> = {
    id: number;
    name: string;
    value: T;
}