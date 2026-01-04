export type Creator = {
  id: string;
  name: string;
  bio: string;
  photoUrl: string;
  socials: {
    linkedin: string;
    github: string;
    instagram: string;
  };
};

export const creatorsData: Creator[] = [
  {
    id: '1',
    name: 'Soumojit Das',
    bio: 'The architect of EduBot, crafting seamless user experiences with a passion for clean code and innovative solutions.',
    photoUrl: '/creators/soumojit-das.jpg',
    socials: {
      linkedin: 'https://www.linkedin.com/in/soumojit-das-66743a309?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app',
      github: 'https://github.com/Soumojit84',
      instagram: 'https://www.instagram.com/souuumo?igsh=Mm8wMXEzd3VyY285',
    },
  },
  {
    id: '2',
    name: 'Sayak Biswas',
    bio: 'The creative visionary behind EduBot’s stunning visuals, dedicated to making learning beautiful and intuitive.',
    photoUrl: '/creators/sayak-biswas.jpeg',
    socials: {
      linkedin: 'https://www.linkedin.com/in/sayak-biswas-a101b3386?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app',
      github: 'https://github.com/Sayak-coder',
      instagram: 'https://www.instagram.com/_wishmaster__7?igsh=MXAyMWc5eWVhdXp0MA==',
    },
  },
  {
    id: '3',
    name: 'Kaniska Bose',
    bio: 'The powerhouse ensuring EduBot runs smoothly, managing data and infrastructure with precision and skill.',
    photoUrl: '/creators/kaniska-bose.jpg',
    socials: {
      linkedin: 'https://www.linkedin.com/in/kaniskabose07?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app',
      github: 'https://github.com/Kaniska07-tech',
      instagram: 'https://www.instagram.com/__kanb__?igsh=OG1mY2ZmaWJycXJn',
    },
  },
  {
    id: '4',
    name: 'Rahul Bose',
    bio: 'The strategic leader guiding the EduBot team, ensuring every feature aligns with the vision of smarter education.',
    photoUrl: '/creators/rahul-bose.jpg',
    socials: {
      linkedin: 'https://www.linkedin.com/in/rahul-bose-b569b4393?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app',
      github: 'https://github.com/BoseRahul2005',
      instagram: 'https://www.instagram.com/bose_r_rahul?igsh=cGpqc2hkNjAwZng0',
    },
  },
];
