export type IFaqItem = {
    id: number;
    question: string;
    answer: string;
    faqCategoryId: number;
    order: number;
    faqCategory?: IFaqCategoryItem | null;
};

export type IFaqCategoryItem = {
    id: number;
    name: string;
    icon: string;
    order: number;
    faqs: IFaqItem[] | null;
};

export type IFaqTableFilters = {
    question: string;
    categoryId?: number | null;
};
