"use client";

import { SessionProvider } from "next-auth/react";
import { ImageKitProvider } from "@imagekit/next";
import { NotificationProvider } from "@/components/Notification";

const urlEndpoint = process.env.NEXT_PUBLIC_URL_ENDPOINT!;

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchInterval={5 * 60}>
      <NotificationProvider>
        <ImageKitProvider urlEndpoint={urlEndpoint}>
          {children}
        </ImageKitProvider>
      </NotificationProvider>
    </SessionProvider>
  );
}
