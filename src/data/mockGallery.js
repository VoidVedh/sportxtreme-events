// Mock gallery data for frontend demonstration
export const MOCK_GALLERY = [
  {
    id: "1",
    url: null, // Will use placeholder gradient
    caption: "Mumbai Corporate Cricket League Finals",
    category: "Corporate",
    event: "Cricket"
  },
  {
    id: "2",
    url: null,
    caption: "City Marathon 2025 Start Line",
    category: "Marathon",
    event: "Running"
  },
  {
    id: "3",
    url: null,
    caption: "Inter-School Championship Awards",
    category: "School",
    event: "Multi-Sport"
  },
  {
    id: "4",
    url: null,
    caption: "Football Super League Match",
    category: "League",
    event: "Football"
  },
  {
    id: "5",
    url: null,
    caption: "Western Mumbai Cyclothon Route",
    category: "Cycling",
    event: "Cycling"
  },
  {
    id: "6",
    url: null,
    caption: "Corporate Swim Challenge",
    category: "Aquatic",
    event: "Swimming"
  },
  {
    id: "7",
    url: null,
    caption: "Basketball Tournament Finals",
    category: "Corporate",
    event: "Basketball"
  },
  {
    id: "8",
    url: null,
    caption: "Charity Half Marathon",
    category: "Marathon",
    event: "Running"
  },
  {
    id: "9",
    url: null,
    caption: "School Badminton Championship",
    category: "School",
    event: "Badminton"
  },
  {
    id: "10",
    url: null,
    caption: "Corporate Cricket League Opening",
    category: "Corporate",
    event: "Cricket"
  },
  {
    id: "11",
    url: null,
    caption: "Marathon Medal Ceremony",
    category: "Marathon",
    event: "Running"
  },
  {
    id: "12",
    url: null,
    caption: "School Sports Day Opening",
    category: "School",
    event: "Multi-Sport"
  }
];

const CATEGORY_COLORS = {
  Corporate: "linear-gradient(135deg, #1a0a0a, #2d1a1a)",
  Marathon: "linear-gradient(135deg, #0a1a0a, #1a2d1a)",
  School: "linear-gradient(135deg, #0a0a1a, #1a1a2d)",
  League: "linear-gradient(135deg, #1a1a0a, #2d2d1a)",
  Cycling: "linear-gradient(135deg, #0a1a1a, #1a2d2d)",
  Aquatic: "linear-gradient(135deg, #0a0a1a, #1a1a3d)",
};

export const getCategoryGradient = (category) => {
  return CATEGORY_COLORS[category] || "linear-gradient(135deg, #0a0a0a, #1a1a1a)";
};
