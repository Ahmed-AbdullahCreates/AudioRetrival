export interface Audio {
  id: number;
  title: string;
  description: string | null;
  transcription: string | null;
  url: string;
  uploaded_at: string;
  category_id: number;
  category_title: string;
  tags: Tag[] | null;
  user_id: string | null;
  
  // Additional properties for UI components
  audioUrl?: string;
  author?: string;
  duration?: string;
  fileFormat?: string;
  fileSize?: number;
  categories?: string[];
  createdAt?: number | string;
}

export interface Category {
  id: number;
  title: string;
  description?: string;
  color?: string;
  icon?: string;
  coverImage?: string;
  count?: number;
  slug?: string;
  featured?: boolean;
}

export interface Tag {
  id: number;
  name: string;
}

export interface SearchParams {
  title?: string;
  category_id?: number;
  tags_ids?: number[];
}

export interface AudioUploadFormData {
  title: string;
  description: string;
  transcription: string;
  category_id: number;
  tags_ids: number[];
  audioFile: File | null;
}