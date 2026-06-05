"use client";

import { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { store } from "./index";
import { hydrateAuth } from "./slices/authSlice";

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const hydrated = useRef(false);

  useEffect(() => {
    if (!hydrated.current) {
      store.dispatch(hydrateAuth());
      hydrated.current = true;
    }
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
