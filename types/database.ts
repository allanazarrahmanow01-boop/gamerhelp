export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Profile {
  id: string;
  username: string;
  avatar_url?: string;
  bio?: string;
  provider?: string;
  steam_id?: string;
  reputation: number;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  post_count: number;
}

export interface Post {
  id: string;
  author_id: string;
  category_id?: number;
  title: string;
  content: string;
  game_tag?: string;
  tags: string[];
  upvotes: number;
  views: number;
  reply_count: number;
  is_solved: boolean;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  // Joined
  profiles?: Profile;
  categories?: Category;
}

export interface Reply {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  upvotes: number;
  is_accepted: boolean;
  parent_id?: string;
  created_at: string;
  // Joined
  profiles?: Profile;
}

export interface LfgPost {
  id: string;
  author_id: string;
  game: string;
  game_mode?: string;
  title: string;
  description: string;
  platform: "PC" | "PlayStation" | "Xbox" | "Nintendo Switch" | "Mobile" | "Cross-platform";
  region: string;
  players_needed: number;
  players_current: number;
  rank?: string;
  mic_required: boolean;
  discord_server?: string;
  is_active: boolean;
  expires_at: string;
  created_at: string;
  // Joined
  profiles?: Profile;
}

// Extend NextAuth types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      provider?: string;
    };
  }
}

// Minimal Database type for Supabase client
export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      categories: { Row: Category; Insert: Partial<Category>; Update: Partial<Category> };
      posts: { Row: Post; Insert: Partial<Post>; Update: Partial<Post> };
      replies: { Row: Reply; Insert: Partial<Reply>; Update: Partial<Reply> };
      lfg_posts: { Row: LfgPost; Insert: Partial<LfgPost>; Update: Partial<LfgPost> };
    };
  };
}
