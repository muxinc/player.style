import { type Author } from "./author";

export type Theme = {
  slug: string;
  title: string;
  description: string;
  author: Author;
  templates: Record<string, any>;
  date?: string;
  coverImage?: string;
  ogImage?: {
    url: string;
  };
  content?: string;
  preview?: boolean;
};
