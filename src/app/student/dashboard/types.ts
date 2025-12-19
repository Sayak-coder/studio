export interface StudentContent {
    id: string;
    title: string;
    subject: string;
    type: 'Class Notes' | 'PYQ' | 'Important Question' | 'Video';
    imageUrl: string;
}

export const newlyAdded: Partial<StudentContent>[] = [
  { id: '1', title: 'Quantum Mechanics Basics', subject: 'Physics', type: 'Class Notes', imageUrl: 'https://picsum.photos/seed/n1/400/600' },
  { id: '2', title: 'Organic Chemistry Reactions', subject: 'Chemistry', type: 'Class Notes', imageUrl: 'https://picsum.photos/seed/n2/400/600' },
  { id: '3', title: 'Data Structures: Trees', subject: 'Computer Science', type: 'Class Notes', imageUrl: 'https://picsum.photos/seed/n3/400/600' },
  { id: '4', title: 'World War II Overview', subject: 'History', type: 'Class Notes', imageUrl: 'https://picsum.photos/seed/n4/400/600' },
  { id: '5', title: 'Calculus II Integrals', subject: 'Mathematics', type: 'Video', imageUrl: 'https://picsum.photos/seed/n5/400/600' },
  { id: '6', title: 'Supply and Demand', subject: 'Economics', type: 'Class Notes', imageUrl: 'https://picsum.photos/seed/n6/400/600' },
];

export const currentYearPYQs: Partial<StudentContent>[] = [
  { id: '7', title: '2023 Mid-Term: Mechanics', subject: 'Physics', type: 'PYQ', imageUrl: 'https://picsum.photos/seed/p1/400/600' },
  { id: '8', title: '2023 Final: Algorithms', subject: 'Computer Science', type: 'PYQ', imageUrl: 'https://picsum.photos/seed/p2/400/600' },
  { id: '9', title: '2023 Mid-Term: British Literature', subject: 'English', type: 'PYQ', imageUrl: 'https://picsum.photos/seed/p3/400/600' },
  { id: '10', title: '2023 Final: Thermodynamics', subject: 'Chemistry', type: 'PYQ', imageUrl: 'https://picsum.photos/seed/p4/400/600' },
];

export const mostImportant: Partial<StudentContent>[] = [
  { id: '11', title: 'Shakespeares Sonnets Analysis', subject: 'English', type: 'Important Question', imageUrl: 'https://picsum.photos/seed/i1/400/600' },
  { id: '12', title: 'The Derivative Explained', subject: 'Mathematics', type: 'Important Question', imageUrl: 'https://picsum.photos/seed/i2/400/600' },
  { id: '13', title: 'Big O Notation', subject: 'Computer Science', type: 'Important Question', imageUrl: 'https://picsum.photos/seed/i3/400/600' },
  { id: '14', title: 'Laws of Motion', subject: 'Physics', type: 'Important Question', imageUrl: 'https://picsum.photos/seed/i4/400/600' },
  { id: '15', title: 'The Cold War', subject: 'History', type: 'Important Question', imageUrl: 'https://picsum.photos/seed/i5/400/600' },
];

export const continueWatching: Partial<StudentContent>[] = [
    { id: '16', title: 'Introduction to AI', subject: 'Computer Science', type: 'Video', imageUrl: 'https://picsum.photos/seed/v1/400/600' },
    { id: '17', title: 'Linear Algebra: Vectors', subject: 'Mathematics', type: 'Video', imageUrl: 'https://picsum.photos/seed/v2/400/600' },
    { id: '18', title: 'The French Revolution', subject: 'History', type: 'Video', imageUrl: 'https://picsum.photos/seed/v3/400/600' },
];
