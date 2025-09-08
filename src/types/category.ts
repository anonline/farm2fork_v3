export type ICategoryTableFilter = {};

export type ICategoryItem = {
    id: number | null;
    name: string;
    slug: string;
    description: string;
    coverUrl: string;
    created_at: string;
    parentId: number | null;
    enabled: boolean;
    Parent: ICategoryItem | null;
    children: ICategoryItem[];
    level: number;
    usageInformation: string;
    storingInformation: string;
    showHome: boolean;
};
