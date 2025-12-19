import data from './placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  title: string;
  subject: string;
  type: 'Class Notes' | 'PYQ' | 'Important Question' | 'Video';
  description: string;
  imageUrl: string;
  imageHint: string;
};

export const PlaceHolderImages: ImagePlaceholder[] = data.placeholderImages;
