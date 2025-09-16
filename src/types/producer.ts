export type IProducerItem = {
    id: string;
    name: string;
    bio: boolean;
    shortDescription: string;
    producingTags: string;
    featuredImage: string;
    coverImage: number;
    galleryIds: number[];
    companyName: string;
    slug: string;
    location: string;
    enabled: boolean;
};

export type IProducerTableFilters = {
    bio: string[];
    enabled: string[];
};

export type IProducerFilters = {
    bio: string[];
    enabled: string[];
};
