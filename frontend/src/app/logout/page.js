"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    // Burada localStorage veya cookie temizleme işlemi yapılabilir
    router.push("/login");
  }, [router]);

  return <p>Çıkış yapılıyor...</p>;
}
