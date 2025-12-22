export type Creator = {
  id: string;
  name: string;
  role: string;
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
    role: 'Lead Developer',
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
    role: 'UI/UX Designer',
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
    role: 'Backend Specialist',
    bio: 'The powerhouse ensuring EduBot runs smoothly, managing data and infrastructure with precision and skill.',
    photoUrl: 'https://picsum.photos/seed/kaniska/200/200',
    socials: {
      linkedin: 'https://www.linkedin.com/',
      github: 'https://github.com/',
      twitter: 'https://twitter.com/',
    },
  },
  {
    id: '4',
    name: 'Rahul Bose',
    role: 'Project Manager',
    bio: 'The strategic leader guiding the EduBot team, ensuring every feature aligns with the vision of smarter education.',
    photoUrl: 'https://picsum.photos/seed/rahul/200/200',
    socials: {
      linkedin: 'https://www.linkedin.com/',
      github: 'https://github.com/',
      twitter: 'https://twitter.com/',
    },
  },
];
