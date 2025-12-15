export type Content = {
  id: string;
  title: string;
  subject: string;
  type: 'Class Notes' | 'PYQ' | 'Important Question';
  content: string;
  authorId: string;
};

export const initialFormData: Omit<Content, 'id' | 'authorId'> = {
  title: '',
  subject: '',
  type: 'Class Notes',
  content: '',
};
