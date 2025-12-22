export type Creator = {
  id: string;
  name: string;
  bio: string;
  photoUrl: string;
  socials: {
    linkedin: string;
    github: string;
    twitter: string;
  };
};

export const creatorsData: Creator[] = [
  {
    id: '1',
    name: 'Soumojit Biswas',
    bio: 'The architect of EduBot, crafting seamless user experiences with a passion for clean code and innovative solutions.',
    photoUrl: 'https://picsum.photos/seed/soumojit/200/200',
    socials: {
      linkedin: 'https://www.linkedin.com/',
      github: 'https://github.com/',
      twitter: 'https://twitter.com/',
    },
  },
  {
    id: '2',
    name: 'Sayak Biswas',
    bio: 'The creative visionary behind EduBot’s stunning visuals, dedicated to making learning beautiful and intuitive.',
    photoUrl: 'https://picsum.photos/seed/sayak/200/200',
    socials: {
      linkedin: 'https://www.linkedin.com/',
      github: 'https://github.com/',
      twitter: 'https://twitter.com/',
    },
  },
  {
    id: '3',
    name: 'Kaniska Bose',
    bio: 'The powerhouse ensuring EduBot runs smoothly, managing data and infrastructure with precision and skill.',
    photoUrl: 'https://storage.googleapis.com/res-a-dev-team-1/image-e5559092-2358-451e-b816-c7759d57a224.png',
    socials: {
      linkedin: 'https://www.linkedin.com/',
      github: 'https://github.com/',
      twitter: 'https://twitter.com/',
    },
  },
  {
    id: '4',
    name: 'Rahul Bose',
    bio: 'The strategic leader guiding the EduBot team, ensuring every feature aligns with the vision of smarter education.',
    photoUrl: 'https://storage.googleapis.com/res-a-dev-team-1/image-e523f545-2f95-46f5-a22c-f6048e986283.png',
    socials: {
      linkedin: 'https://www.linkedin.com/',
      github: 'https://github.com/',
      twitter: 'https://twitter.com/',
    },
  },
];
