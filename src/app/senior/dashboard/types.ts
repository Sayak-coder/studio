export type Content = {
  id: string;
  title: string;
  subject: string;
  type: 'Class Notes' | 'PYQ' | 'Important Question';
  content: string;
  authorId: string;
  roles: string[];
  fileUrl?: string;
  fileType?: string;
  year?: 1 | 2 | 3 | 4;
  category?: string; // Stream/department
};

export const initialFormData: Omit<Content, 'id' | 'authorId' | 'roles'> = {
  title: '',
  subject: '',
  type: 'Class Notes',
  content: '',
  fileUrl: '',
  fileType: '',
  year: undefined,
  category: undefined,
};
