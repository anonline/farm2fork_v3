

export enum OptionsEnum {
    HomeHeroBgImage             = "home_heroBg",
    HomeHeroOverlay             = "home_heroOverlay",
    HomeHeroTitle               = "home_heroTitle",
    HomeHeroPrimaryBtnText      = "home_heroPrimaryButtonText",
    HomeHeroSecondaryBtnText    = "home_heroSecondaryButtonText",
    HomeHeroMinHeight           = "home_heroMinHeight",
    MaxFileUploadSizeMB        = "max_file_upload_mb",
    ProductPlaceholderImageURL = "product_placeholder_image_url",
}

export type Option<T> = {
    id: number;
    name: string;
    value: T;
}