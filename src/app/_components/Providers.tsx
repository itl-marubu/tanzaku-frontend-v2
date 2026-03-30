"use client";

import { Provider } from "jotai";
import { FestivalModeProvider } from "./FestivalModeProvider";

export const Providers: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <Provider>
      <FestivalModeProvider>{children}</FestivalModeProvider>
    </Provider>
  );
};
