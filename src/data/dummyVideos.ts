export interface DummyVideo {
  id: string;
  title: string;
  description: string;
  subject: string;
  grade_level: string;
  duration: number;
  view_count: number;
  is_premium: boolean;
  premium_price?: number | null;
  created_at: string;
  video_url: string;
  thumbnail_url: string;
  voice_summary_url?: string | null;
  algorand_txn_id?: string | null;
  reddit_discussion_url?: string | null;
  uploader: {
    full_name: string;
    role: string;
  };
}

export const dummyVideos: DummyVideo[] = [
  {
    id: '1',
    title: 'Introduction to Algebra - Basic Concepts',
    description: 'Learn the fundamentals of algebra with clear explanations and examples. This comprehensive tutorial covers variables, equations, and problem-solving techniques that will help you master algebraic concepts. Perfect for high school students beginning their algebra journey.',
    subject: 'Mathematics',
    grade_level: 'High School (9-12)',
    duration: 1200,
    view_count: 15420,
    is_premium: false,
    premium_price: null,
    created_at: '2024-01-15T10:30:00Z',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail_url: 'https://images.pexels.com/photos/3401403/pexels-photo-3401403.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1',
    uploader: { full_name: 'Prof. Sarah Johnson', role: 'teacher' }
  },
  {
    id: '2',
    title: 'Advanced Calculus Masterclass - Premium Course',
    description: 'Deep dive into advanced calculus concepts with practical applications. This premium course includes derivatives, integrals, limits, and real-world problem solving. Includes downloadable worksheets, practice problems, and one-on-one tutoring sessions.',
    subject: 'Mathematics',
    grade_level: 'College',
    duration: 2400,
    view_count: 8930,
    is_premium: true,
    premium_price: 19.99,
    created_at: '2024-01-14T14:20:00Z',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnail_url: 'https://images.pexels.com/photos/3401403/pexels-photo-3401403.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1',
    algorand_txn_id: 'ALGO123456789',
    uploader: { full_name: 'Dr. Michael Chen', role: 'teacher' }
  },
  {
    id: '3',
    title: 'The Solar System Explained',
    description: 'A comprehensive guide to our solar system and the planets. Explore the eight planets, their moons, and the fascinating phenomena that occur in our cosmic neighborhood. Includes stunning visuals and interactive elements.',
    subject: 'Science',
    grade_level: 'Middle School (6-8)',
    duration: 980,
    view_count: 23100,
    is_premium: false,
    premium_price: null,
    created_at: '2024-01-13T09:15:00Z',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail_url: 'https://images.pexels.com/photos/73873/star-clusters-rosette-nebula-star-galaxies-73873.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1',
    uploader: { full_name: 'Dr. Emily Rodriguez', role: 'teacher' }
  },
  {
    id: '4',
    title: 'Premium Python Programming Course',
    description: 'Complete Python programming course with advanced projects and certification. Learn from basics to advanced concepts including web development, data science, and machine learning. Includes 50+ coding exercises and real-world projects.',
    subject: 'Technology',
    grade_level: 'College',
    duration: 18000,
    view_count: 31200,
    is_premium: true,
    premium_price: 49.99,
    created_at: '2024-01-12T13:20:00Z',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnail_url: 'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1',
    algorand_txn_id: 'ALGO987654321',
    uploader: { full_name: 'Dev. Alex Thompson', role: 'teacher' }
  },
  {
    id: '5',
    title: 'World War II History Overview',
    description: 'Understanding the key events and impact of World War II. This comprehensive overview covers the major battles, political decisions, and social changes that shaped the modern world. Includes primary source documents and expert analysis.',
    subject: 'History',
    grade_level: 'High School (9-12)',
    duration: 1500,
    view_count: 12500,
    is_premium: false,
    premium_price: null,
    created_at: '2024-01-11T16:45:00Z',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    thumbnail_url: 'https://images.pexels.com/photos/159868/lost-places-old-decay-ruin-159868.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1',
    uploader: { full_name: 'Prof. David Kim', role: 'teacher' }
  },
  {
    id: '6',
    title: 'Digital Art Masterclass - Premium Content',
    description: 'Professional digital art techniques with industry secrets and portfolio building. Learn from concept art to final rendering using industry-standard tools. Includes brush packs, texture libraries, and portfolio review sessions.',
    subject: 'Art',
    grade_level: 'College',
    duration: 3600,
    view_count: 7800,
    is_premium: true,
    premium_price: 29.99,
    created_at: '2024-01-10T11:30:00Z',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    thumbnail_url: 'https://images.pexels.com/photos/1162251/pexels-photo-1162251.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1',
    uploader: { full_name: 'Artist Lisa Wong', role: 'teacher' }
  },
  {
    id: '7',
    title: 'Shakespeare\'s Hamlet Analysis',
    description: 'Deep literary analysis of Shakespeare\'s masterpiece Hamlet. Explore themes, character development, and historical context. Perfect for AP English students and literature enthusiasts.',
    subject: 'English',
    grade_level: 'High School (9-12)',
    duration: 1800,
    view_count: 9200,
    is_premium: false,
    premium_price: null,
    created_at: '2024-01-09T14:15:00Z',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    thumbnail_url: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1',
    uploader: { full_name: 'Prof. Margaret Smith', role: 'teacher' }
  },
  {
    id: '8',
    title: 'Spanish Conversation Basics',
    description: 'Learn essential Spanish conversation skills for beginners. Practice common phrases, pronunciation, and cultural context. Interactive exercises and real-world scenarios included.',
    subject: 'Languages',
    grade_level: 'Adult Learning',
    duration: 1350,
    view_count: 18700,
    is_premium: false,
    premium_price: null,
    created_at: '2024-01-08T10:00:00Z',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    thumbnail_url: 'https://images.pexels.com/photos/267669/pexels-photo-267669.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1',
    uploader: { full_name: 'Señora Maria Garcia', role: 'teacher' }
  },
  {
    id: '9',
    title: 'Music Theory Fundamentals',
    description: 'Understanding the building blocks of music theory. Learn about scales, chords, rhythm, and harmony. Perfect for aspiring musicians and music students.',
    subject: 'Music',
    grade_level: 'High School (9-12)',
    duration: 1680,
    view_count: 14300,
    is_premium: false,
    premium_price: null,
    created_at: '2024-01-07T15:30:00Z',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    thumbnail_url: 'https://images.pexels.com/photos/164743/pexels-photo-164743.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1',
    uploader: { full_name: 'Maestro Roberto Vivaldi', role: 'teacher' }
  },
  {
    id: '10',
    title: 'Advanced Chemistry Lab Techniques - Premium',
    description: 'Professional laboratory techniques for advanced chemistry students. Safety protocols, equipment usage, and experimental design. Includes virtual lab simulations and safety certifications.',
    subject: 'Science',
    grade_level: 'College',
    duration: 2700,
    view_count: 5600,
    is_premium: true,
    premium_price: 39.99,
    created_at: '2024-01-06T12:45:00Z',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
    thumbnail_url: 'https://images.pexels.com/photos/2280549/pexels-photo-2280549.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1',
    algorand_txn_id: 'ALGO456789123',
    uploader: { full_name: 'Dr. Jennifer Liu', role: 'teacher' }
  },
  {
    id: '11',
    title: 'Elementary Math: Addition and Subtraction',
    description: 'Fun and engaging introduction to addition and subtraction for young learners. Colorful animations, interactive games, and practice exercises make learning math enjoyable.',
    subject: 'Mathematics',
    grade_level: 'Elementary (K-5)',
    duration: 900,
    view_count: 28900,
    is_premium: false,
    premium_price: null,
    created_at: '2024-01-05T09:20:00Z',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
    thumbnail_url: 'https://images.pexels.com/photos/3401403/pexels-photo-3401403.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1',
    uploader: { full_name: 'Teacher Amy Johnson', role: 'teacher' }
  },
  {
    id: '12',
    title: 'Introduction to Artificial Intelligence',
    description: 'Explore the fascinating world of AI and machine learning. Understanding algorithms, neural networks, and real-world applications. Perfect for computer science students and tech enthusiasts.',
    subject: 'Technology',
    grade_level: 'College',
    duration: 2100,
    view_count: 22400,
    is_premium: false,
    premium_price: null,
    created_at: '2024-01-04T16:10:00Z',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail_url: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1',
    uploader: { full_name: 'Dr. Raj Patel', role: 'teacher' }
  }
];

export const dummyTimestamps = {
  '1': [
    { id: 't1-1', title: 'Introduction to Algebra', time_seconds: 0 },
    { id: 't1-2', title: 'What are Variables?', time_seconds: 120 },
    { id: 't1-3', title: 'Basic Operations', time_seconds: 300 },
    { id: 't1-4', title: 'Solving Simple Equations', time_seconds: 600 },
    { id: 't1-5', title: 'Practice Problems', time_seconds: 900 }
  ],
  '2': [
    { id: 't2-1', title: 'Course Overview', time_seconds: 0 },
    { id: 't2-2', title: 'Limits and Continuity', time_seconds: 300 },
    { id: 't2-3', title: 'Derivatives', time_seconds: 900 },
    { id: 't2-4', title: 'Integration Techniques', time_seconds: 1500 },
    { id: 't2-5', title: 'Applications', time_seconds: 2000 }
  ],
  '3': [
    { id: 't3-1', title: 'Our Solar System', time_seconds: 0 },
    { id: 't3-2', title: 'The Sun', time_seconds: 150 },
    { id: 't3-3', title: 'Inner Planets', time_seconds: 350 },
    { id: 't3-4', title: 'Outer Planets', time_seconds: 600 },
    { id: 't3-5', title: 'Moons and Asteroids', time_seconds: 800 }
  ]
};

export const dummyComments = {
  '1': [
    {
      id: 'c1-1',
      content: 'This is exactly what I needed to understand algebra! The explanations are so clear.',
      created_at: '2024-01-16T10:30:00Z',
      user: { full_name: 'Student Mike' }
    },
    {
      id: 'c1-2',
      content: 'Great video! Could you make one about quadratic equations next?',
      created_at: '2024-01-16T14:20:00Z',
      user: { full_name: 'Jessica Chen' }
    },
    {
      id: 'c1-3',
      content: 'Thank you for making this free! Education should be accessible to everyone.',
      created_at: '2024-01-17T09:15:00Z',
      user: { full_name: 'Carlos Rodriguez' }
    }
  ],
  '2': [
    {
      id: 'c2-1',
      content: 'Worth every penny! The premium content is incredibly detailed.',
      created_at: '2024-01-15T11:45:00Z',
      user: { full_name: 'Advanced Student' }
    }
  ],
  '3': [
    {
      id: 'c3-1',
      content: 'My kids love this video! Perfect for homeschooling.',
      created_at: '2024-01-14T16:30:00Z',
      user: { full_name: 'Parent Teacher' }
    },
    {
      id: 'c3-2',
      content: 'The visuals are amazing! Makes space feel so real.',
      created_at: '2024-01-15T12:20:00Z',
      user: { full_name: 'Space Enthusiast' }
    }
  ]
};

export const dummyUsers = [
  {
    id: 'user-1',
    email: 'sarah.johnson@university.edu',
    full_name: 'Prof. Sarah Johnson',
    role: 'teacher',
    subscription_status: 'creator',
    created_at: '2023-09-15T10:00:00Z'
  },
  {
    id: 'user-2',
    email: 'michael.chen@college.edu',
    full_name: 'Dr. Michael Chen',
    role: 'teacher',
    subscription_status: 'creator',
    created_at: '2023-08-20T14:30:00Z'
  },
  {
    id: 'user-3',
    email: 'emily.rodriguez@school.edu',
    full_name: 'Dr. Emily Rodriguez',
    role: 'teacher',
    subscription_status: 'free',
    created_at: '2023-10-05T09:15:00Z'
  },
  {
    id: 'user-4',
    email: 'student.mike@email.com',
    full_name: 'Student Mike',
    role: 'student',
    subscription_status: 'premium',
    created_at: '2024-01-10T16:20:00Z'
  }
];