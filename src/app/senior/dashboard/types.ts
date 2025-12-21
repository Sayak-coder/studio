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
};

export const initialFormData: Omit<Content, 'id' | 'authorId' | 'roles'> = {
  title: '',
  subject: '',
  type: 'Class Notes',
  content: '',
  fileUrl: '',
  fileType: '',
};
