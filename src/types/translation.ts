// ----------------------------------------------------------------------

export type ITranslation = {
    id: number;
    language: string;
    namespace: string;
    key: string;
    value: string;
    created_at?: string;
    updated_at?: string;
};

export type ITranslationTableFilters = {
    searchTerm: string;
};

export type ITranslationRow = {
    id: number;
    namespace: string;
    key: string;
    [key: string]: any; // For dynamic language columns (en, hu, etc.)
};

export type ITranslationUpdate = {
    id: number;
    language: string;
    value: string;
};
