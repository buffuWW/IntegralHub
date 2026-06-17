import { LoginForm } from "@/components/auth/AuthForms";
import { Suspense } from "react";

export default function LoginPage() {
  return <main className="mx-auto flex min-h-[70vh] max-w-md items-center px-4"><Suspense><LoginForm /></Suspense></main>;
}
