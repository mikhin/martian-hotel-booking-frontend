import { atom } from "nanostores";

export type RouterState = 
  | { route: "hotelEdit"; params: { id: string } }
  | { route: "hotelList" }
  | null;

export const $router = atom<RouterState>(null);
