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
  category: string; 
  categoryId: number;
  publish_date: Date | string;
  publish: string;
}