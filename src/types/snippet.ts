export interface Snippet {
  id: number;
  title: string;
  visibility: string;
  language: string;
  description: string | null;
  content: string;
  folderId: number | null;
  tags: string[] | null;
  starred: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
} 