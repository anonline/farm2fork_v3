export type IArticleItem = {
    id?: number,
    title: string,
    medium: string,
    image: string,
    year: string,
    link: string,
    category?: string,
    publish_date: Date | string, // Use Date for internal handling, but can be string for API compatibility
    publish: string,
}