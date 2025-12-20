export type Content = {
  id: string;
  title: string;
  subject: string;
  type: 'Class Notes' | 'PYQ' | 'Important Question';
  content: string;
  authorId: string;
  authorName: string;
  role: string;
  fileUrl?: string;
  fileType?: string;
};

export const initialFormData: Omit<Content, 'id' | 'authorId' | 'authorName' | 'role'> = {
  title: '',
  subject: '',
  type: 'Class Notes',
  content: '',
  fileUrl: '',
  fileType: '',
};
