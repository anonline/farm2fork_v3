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
};

export type IProducerTableFilters = {
    bio: string[];
};

export type IProducerFilters = {
    bio: string[];
};
