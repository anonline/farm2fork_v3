

export enum OptionsEnum {
    HomeHeroBgImage             = "home_heroBg",
    HomeHeroOverlay             = "home_heroOverlay",
    HomeHeroTitle               = "home_heroTitle",
    HomeHeroPrimaryBtnText      = "home_heroPrimaryButtonText",
    HomeHeroSecondaryBtnText    = "home_heroSecondaryButtonText",
    HomeHeroMinHeight           = "home_heroMinHeight",
    MaxFileUploadSizeMB         = "max_file_upload_mb",
    ProductPlaceholderImageURL  = "product_placeholder_image_url",
    MinimumPurchaseForPublic    = "minimum_purchase_for_public",
    MinimumPurchaseForVIP       = "minimum_purchase_for_vip",
    MinimumPurchaseForCompany   = "minimum_purchase_for_company"
}

export type Option<T> = {
    id: number;
    name: string;
    value: T;
}