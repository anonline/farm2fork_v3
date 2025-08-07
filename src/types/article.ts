export interface ICategory {
  id: number;
  title: string;
}

export interface IArticleItem {
  id: number;
  title: string;
  medium: string;
  image: string;
  year: string;
  link: string;
  categories: ICategory[];
  categoryIds: number[];
  publish_date: Date | string;
  publish: string;
}