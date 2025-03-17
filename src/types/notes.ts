export interface Tag {
  id: string;
  name: string;
  color?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags?: Tag[];
  createdAt: string;
  updatedAt: string;
}
