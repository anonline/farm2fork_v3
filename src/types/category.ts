export type ICategoryTableFilter = {};

export type ICategoryItem = {
    id: number;
    name: string;
    slug: string;
    description: string;
    coverUrl: string;
    created_at: string;
    parentId: number;
    enabled: boolean;
    Parent: ICategoryItem | null;
    children: ICategoryItem[];
};
