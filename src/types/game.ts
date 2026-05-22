export interface Game {
  id: string;
  title: string;
  price: number;
  concept: string;
  platforms: string[];
  genre: string;
  publisher: string;
  publishedDate: string;
  coverImage: string;
  coverGradient?: string;
}

export interface CartItem {
  game: Game;
  quantity: number;
}

export interface OrderItem {
  game: Game;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  processingFee: number;
  total: number;
  email: string;
  status: string;
  createdAt: string;
}
