"use client";
import {Button} from "@heroui/button";
import {useRouter} from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
       <h1>Welcome to PO-Tracking  app</h1>
      <Button color="primary" onPress={() => router.push("/login")}>Login</Button>
    </section>
  );
}
