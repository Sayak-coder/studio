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
    name: 'Soumojit Das',
    bio: 'The architect of EduBot, crafting seamless user experiences with a passion for clean code and innovative solutions.',
    photoUrl: 'https://storage.googleapis.com/res-a-dev-team-1/image-49e0c71a-e9d6-444a-952a-30277a064b59.jpeg',
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
    photoUrl: 'https://storage.googleapis.com/res-a-dev-team-1/image-a4178568-b8d0-435e-990a-5b1216a61763.png',
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
