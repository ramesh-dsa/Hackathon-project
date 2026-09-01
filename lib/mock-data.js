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
