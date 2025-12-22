export type Content = {
  id: string;
  title: string;
  subject: string;
  type: 'Class Notes' | 'PYQ' | 'Important Question';
  content: string;
  authorId: string;
  authorName?: string; // Made optional
  roles: string[];
  fileUrl?: string;
  fileType?: string;
};

export const initialFormData: Omit<Content, 'id' | 'authorId' | 'authorName' | 'roles'> = {
  title: '',
  subject: '',
  type: 'Class Notes',
  content: '',
  fileUrl: '',
  fileType: '',
};
