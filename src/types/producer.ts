export type IProducerItem = {
    id: number;
    name: string;
    bio: boolean;
    shortDescription: string;
    producingTags: string;
    featuredImage: number;
    coverImage: number;
    galleryIds: number[];
    companyName: string;
};

export type IProducerTableFilters = {
    bio: string[];
};

export type IProducerFilters = {
    bio: string[];
};
