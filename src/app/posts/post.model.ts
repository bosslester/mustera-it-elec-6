export interface Comment {
date: string|number|Date;
  _id?: string;
  text: string;
  creator: string;
  createdAt: string;
  reactions: {
    like: number;
    love: number;
    laugh: number;
    sad: number;
  };
  userReaction?: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  imagePath: string;
  creator: string;
  comments?: Comment[];
  reactions?: {
    like: number;
    love: number;
    laugh: number;
    sad: number;
  };
  userReaction?: string|null;
} 