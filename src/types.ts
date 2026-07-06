export interface DBVenue {
  id: number;
  hall_name: string;
  zone_name: string;
  created_at: string;
}

export interface DBBooth {
  id: number;
  venue_id: number;
  booth_number: string;
  name: string;
  description?: string;
  link?: string;
  image_url?: string;
  map_x: number;
  map_y: number;
  is_featured: boolean;
  status: number;
  created_at: string;
  updated_at: string;
}

export interface DBWork {
  id: number;
  name: string;
  type: 'game' | 'anime' | 'other';
  created_at: string;
}

export interface DBFreebie {
  id: number;
  booth_id: number;
  name: string;
  get_method?: string;
  get_type?: string;
  link?: string;
  image_url?: string;
  is_announced: boolean;
  created_at: string;
  updated_at: string;
}

export interface Freebie {
  id: string;
  name: string;
  type: 'card' | 'bag' | 'badge' | 'sticker' | 'fan' | 'poster' | 'other' | string;
  description: string;
  condition: string;
  difficulty: 'easy' | 'medium' | 'hard' | string;
  game_ip?: string;
  anime_ip?: string;
  official_link?: string;
  image_url?: string;
  is_announced?: boolean;
}

export interface Booth {
  id: string;
  name: string;
  code: string;
  hall: string;
  category: 'game' | 'virtual' | 'model' | 'tabletop' | 'creator' | 'bazaar' | 'romance' | 'tech' | 'unknown' | 'other';
  description: string;
  tags: string[];
  freebies: Freebie[];
  mapX: number;
  mapY: number;
  width?: number;
  height?: number;
  featured?: boolean;
  status?: number;
  game_ip?: string;
  anime_ip?: string;
  official_link?: string;
  image_url?: string;
}

export interface Hall {
  id: string;
  name: string;
  theme: string;
  color: string;
  bgGrad: string;
  description: string;
}
