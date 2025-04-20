import { 
  Music, BookOpen, Radio, Mic, Headphones, FileAudio, 
  Film, Cpu, Volume2 
} from 'lucide-react';

type CategoryLike = {
  id?: number;
  title: string;
  color?: string;
  icon?: string;
};

const CATEGORY_COLORS = {
  music: 'bg-blue-100 text-blue-600',
  audiobook: 'bg-orange-100 text-orange-600',
  podcast: 'bg-purple-100 text-purple-600',
  quran:'bg-green-100 text-green-600',
  entertainment: 'bg-pink-100 text-pink-600',
  technology: 'bg-indigo-100 text-indigo-600',
  'sound effects': 'bg-amber-100 text-amber-600',
  radio: 'bg-orange-100 text-orange-600',
} as const;

export const getCategoryIcon = (category: CategoryLike, iconSize: number = 24) => {
  // If icon is provided directly, use that
  if (category.icon) {
    switch (category.icon.toLowerCase()) {
      case 'music': return <Music size={iconSize} />;
      case 'book': return <BookOpen size={iconSize} />;
      case 'book-open': return <BookOpen size={iconSize} />;
      case 'mic': return <Mic size={iconSize} />;
      case 'headphones': return <Headphones size={iconSize} />;
      case 'file-audio': return <FileAudio size={iconSize} />;
      case 'radio': return <Radio size={iconSize} />;
      case 'film': return <Film size={iconSize} />;
      case 'cpu': return <Cpu size={iconSize} />;
      case 'wave': return <Volume2 size={iconSize} />;
      case 'volume2': return <Volume2 size={iconSize} />;
      default: return <FileAudio size={iconSize} />;
    }
  }

  // Determine icon by category title
  const lowercaseTitle = category.title.toLowerCase();
  switch (lowercaseTitle) {
    case 'music': return <Music size={iconSize} />;
    case 'audiobook':
    case 'audiobooks':
    case 'books': return <BookOpen size={iconSize} />;
    case 'podcast':
    case 'podcasts': return <Mic size={iconSize} />;
    case 'quran':
    case 'religious': return <BookOpen size={iconSize} />;
    case 'radio': return <Radio size={iconSize} />;
    case 'entertainment': return <Film size={iconSize} />;
    case 'technology': return <Cpu size={iconSize} />;
    case 'sound effects': return <Volume2 size={iconSize} />;
    default: return <FileAudio size={iconSize} />;
  }
};

export const getCategoryColorClass = (category: CategoryLike): string => {
  const lowercaseTitle = category.title.toLowerCase();

  // First try to match by title
  for (const [key, value] of Object.entries(CATEGORY_COLORS)) {
    if (lowercaseTitle.includes(key)) {
      return value;
    }
  }

  // If no match by title, use ID-based colors
  if (category.id !== undefined) {
    const colorId = Math.abs(category.id) % 8;
    switch (colorId) {
      case 0: return 'bg-blue-100 text-blue-600';
      case 1: return 'bg-purple-100 text-purple-600';
      case 2: return 'bg-amber-100 text-amber-600';
      case 3: return 'bg-green-100 text-green-600';
      case 4: return 'bg-pink-100 text-pink-600';
      case 5: return 'bg-indigo-100 text-indigo-600';
      case 6: return 'bg-teal-100 text-teal-600';
      case 7: return 'bg-orange-100 text-orange-600';
    }
  }

  // Fallback color based on string hash
  const hash = lowercaseTitle.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colorId = hash % 8;
  switch (colorId) {
    case 0: return 'bg-blue-100 text-blue-600';
    case 1: return 'bg-purple-100 text-purple-600';
    case 2: return 'bg-amber-100 text-amber-600';
    case 3: return 'bg-green-100 text-green-600';
    case 4: return 'bg-pink-100 text-pink-600';
    case 5: return 'bg-indigo-100 text-indigo-600';
    case 6: return 'bg-teal-100 text-teal-600';
    case 7: return 'bg-orange-100 text-orange-600';
  }

  // Final fallback
  return 'bg-gray-100 text-gray-600';
};