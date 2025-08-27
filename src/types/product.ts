import type { IDateValue } from './common';
import type { IProducerItem } from './producer';
import type { ICategoryItem } from './category';

// ----------------------------------------------------------------------

export type IProductFilters = {
    rating: string;
    gender: string[];
    category: string;
    colors: string[];
    priceRange: number[];
};

export type IProductTableFilters = {
    stock: string[];
    publish: string[];
    bio: string[];
};

export type IProductReview = {
    id: string;
    name: string;
    rating: number;
    comment: string;
    helpful: number;
    avatarUrl: string;
    postedAt: IDateValue;
    isPurchased: boolean;
    attachments?: string[];
};

export const Months = {
    January: 'Január',
    February: "Február",
    March: "Március",
    April: "April",
    May: "May",
    June: "Június",
    July: "Július",
    August: "Augusztus",
    September: "Szeptember",
    October: "October",
    November: "November",
    December: "December",
} as const;
export type MonthKeys = keyof typeof Months;

export type IProductItem = {
    storingInformation: any;
    usageInformation: any;
    id: number;
    sku: string;
    name: string;
    shortDescription: string;
    cardText?: string;
    featuredImage: string;
    stepQuantity: number;
    mininumQuantity: number;
    maximumQuantity: number;
    url: string;
    slug: string;
    unit: string;
    bio: boolean;
    grossPrice: number;
    salegrossPrice: number | null;
    netPrice: number;
    netPriceVIP: number;
    netPriceCompany: number;
    vat: number;
    seasonality: MonthKeys[],
    featured: boolean,
    star: boolean,
    code: string;
    price: number;
    taxes: number;
    tags: string[];
    sizes: string[];
    publish: string;
    gender: string[];
    coverUrl: string;
    images: string[];
    colors: string[];
    quantity: number;
    category?: ICategoryItem[];
    available: number;
    totalSold: number;
    description: string;
    totalRatings: number;
    totalReviews: number;
    createdAt: IDateValue;
    inventoryType: string;
    subDescription: string;
    priceSale: number | null;
    reviews: IProductReview[];
    producerId: number;
    producer?: IProducerItem;
    newLabel: {
        content: string;
        enabled: boolean;
    };
    saleLabel: {
        content: string;
        enabled: boolean;
    };
    ratings: {
        name: string;
        starCount: number;
        reviewCount: number;
    }[];
    stock: number | null;
    backorder: boolean;
};

export type IProductCategory = {
    id: number;
    name: string;
    slug: string;
    description: string;
    created_at: Date;
    parentId: number | null | undefined;
    coverUrl: string;
    enabled: boolean;
    order: number;
};
