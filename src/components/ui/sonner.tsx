"use client";

import { Toaster as SonnerToaster } from "sonner";

export type ToasterProps = React.ComponentProps<typeof SonnerToaster>;

export function Toaster(props: ToasterProps) {
  return (
    <SonnerToaster
      position="bottom-right"
      theme="dark"
      richColors={false}
      closeButton
      {...props}
    />
  );
}
