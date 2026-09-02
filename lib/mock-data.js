export const users = [
  {
    id: "u1",
    name: "Ramesh",
    avatar: "https://i.pravatar.cc/150?u=ramesh",
    location: "Bangalore, India",
    bio: "Software engineer passionate about building scalable backends.",
    rating: 4.8,
    reviewCount: 24,
    verified: true,
    offers: ["Java", "DSA", "HTML/CSS"],
    needs: ["UI/UX", "Photoshop"],
    coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop",
    languages: ["English", "Hindi"],
    availability: "Weekends & Evenings",
    joinedDate: "January 2023",
    reviews: [
      { id: "rv1", author: "Priya", avatar: "https://i.pravatar.cc/150?u=priya", rating: 5, date: "2 months ago", text: "Ramesh is an excellent Java teacher. Very patient and explains concepts clearly." },
      { id: "rv2", author: "Arun", avatar: "https://i.pravatar.cc/150?u=arun", rating: 4, date: "5 months ago", text: "Helped me understand DSA from scratch. Highly recommended!" }
    ],
  },
  {
    id: "u2",
    name: "Priya",
    avatar: "https://i.pravatar.cc/150?u=priya",
    location: "Chennai, India",
    bio: "Senior product designer helping engineers learn design.",
    rating: 4.9,
    reviewCount: 56,
    verified: true,
    offers: ["UI/UX", "Figma", "Design Systems"],
    needs: ["Java", "Next.js"],
    coverImage: "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=2000&auto=format&fit=crop",
    languages: ["English", "Tamil"],
    availability: "Weekdays 9AM-5PM",
    joinedDate: "March 2022",
    reviews: [
      { id: "rv3", author: "Ramesh", avatar: "https://i.pravatar.cc/150?u=ramesh", rating: 5, date: "1 month ago", text: "Priya's UI/UX insights transformed my project." },
      { id: "rv4", author: "Divya", avatar: "https://i.pravatar.cc/150?u=divya", rating: 5, date: "4 months ago", text: "Best Figma tutor on the platform." }
    ],
  },
  {
    id: "u3",
    name: "Arun",
    avatar: "https://i.pravatar.cc/150?u=arun",
    location: "Mumbai, India",
    bio: "Data scientist looking to improve video editing skills for YouTube.",
    rating: 4.6,
    reviewCount: 12,
    verified: true,
    offers: ["Python", "Photoshop", "Machine Learning"],
    needs: ["Video Editing", "DSA"],
    coverImage: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?q=80&w=2070&auto=format&fit=crop",
    languages: ["English", "Marathi"],
    availability: "Flexible",
    joinedDate: "June 2023",
    reviews: [
      { id: "rv5", author: "Ramesh", avatar: "https://i.pravatar.cc/150?u=ramesh", rating: 4, date: "2 weeks ago", text: "Great Photoshop tips, very practical." }
    ],
  },
  {
    id: "u4",
    name: "Divya",
    avatar: "https://i.pravatar.cc/150?u=divya",
    location: "Hyderabad, India",
    bio: "Freelance video editor and content creator.",
    rating: 5.0,
    reviewCount: 8,
    verified: false,
    offers: ["Video Editing", "Premiere Pro", "Public Speaking"],
    needs: ["Python"],
    coverImage: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=2071&auto=format&fit=crop",
    languages: ["English", "Telugu"],
    availability: "Evenings",
    joinedDate: "November 2023",
    reviews: [
      { id: "rv6", author: "Arun", avatar: "https://i.pravatar.cc/150?u=arun", rating: 5, date: "1 week ago", text: "Divya taught me Premiere Pro in just a few sessions. Amazing!" }
    ],
  },
];

export const exchanges = [
  {
    id: "e1",
    status: "in-progress",
    you: { name: "Ramesh", offering: "Java" },
    partner: { name: "Priya", offering: "UI/UX", avatar: "https://i.pravatar.cc/150?u=priya" },
    lastUpdated: "2 days ago",
  },
  {
    id: "e2",
    status: "completed",
    you: { name: "Ramesh", offering: "HTML/CSS" },
    partner: { name: "Arun", offering: "Photoshop", avatar: "https://i.pravatar.cc/150?u=arun" },
    lastUpdated: "1 month ago",
  }
];

export const requests = {
  incoming: [
    {
      id: "r1",
      user: users.find(u => u.name === "Priya"),
      offering: "UI/UX",
      wanting: "Java",
      date: "Today"
    }
  ],
  sent: [
    {
      id: "r2",
      user: users.find(u => u.name === "Arun"),
      offering: "DSA",
      wanting: "Photoshop",
      status: "pending",
      date: "Yesterday"
    }
  ]
};
