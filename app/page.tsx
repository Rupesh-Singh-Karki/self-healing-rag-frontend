"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store";

export default function Home() {
  const token = useAppSelector((state) => state.auth.token);
  const router = useRouter();

  useEffect(() => {
    if (token) {
      router.replace("/chat");
    } else {
      router.replace("/login");
    }
  }, [token, router]);

  return null;
}
