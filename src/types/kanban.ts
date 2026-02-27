export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type Tag = 'vigilancia' | 'regulacao' | 'adm' | 'comunicacao' | 'ti';

export interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  columnId: string;
  title: string;
  description?: string;
  priority: Priority;
  tags: Tag[];
  assignees: string[]; // URLs or Initials
  dueDate?: string; // ISO Date
  checklist: ChecklistItem[];
  comments: Comment[];
  createdAt: string;
}

export interface Column {
  id: string;
  title: string;
  order: number;
  color?: string;
}

export interface Author {
  id: string;
  name: string;
  email?: string;
  role?: string;
  avatar?: string;
}

export interface Board {
  id: string;
  title: string;
  columns: Column[];
  tasks: Task[];
  meetings?: Meeting[];
  authors?: Author[];
}
