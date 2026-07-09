"use client";

import { useRef, useState } from "react";
import {
  EMPTY_ADDON_STATE,
  buildHydrationCart,
  type Cart,
} from "@/lib/checkout";

export function useFreeMaster(
  cart: Cart,
  setCart: (cart: Cart) => void,
): readonly [boolean, (free: boolean) => void] {
  const [free, setFreeState] = useState(false);
  const previous = useRef<Cart | null>(null);

  const setFree = (next: boolean) => {
    if (next && !free) {
      previous.current = cart;
      setCart(buildHydrationCart(1, EMPTY_ADDON_STATE));
    } else if (!next && free && previous.current) {
      setCart(previous.current);
    }
    setFreeState(next);
  };

  return [free, setFree] as const;
}
