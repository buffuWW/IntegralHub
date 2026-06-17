"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export default function AdminLoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(formData: FormData) {
    setLoading(true);
    setError("");
    const response = await fetch("/api/admin/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ login: formData.get("login"), password: formData.get("password") })
    });
    const json = await response.json() as { success: boolean; error?: { message: string } };
    setLoading(false);
    if (json.success) window.location.href = "/admin";
    else setError(json.error?.message ?? "Ошибка входа");
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md items-center px-4">
      <form action={submit} className="w-full rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="mb-5 text-2xl font-black">Вход администратора</h1>
        <label className="mb-3 block">
          <span className="mb-1 block font-semibold">Логин</span>
          <input name="login" required className="focus-ring w-full rounded-md border border-slate-300 px-3 py-2" />
        </label>
        <label className="mb-4 block">
          <span className="mb-1 block font-semibold">Пароль</span>
          <input name="password" required type="password" className="focus-ring w-full rounded-md border border-slate-300 px-3 py-2" />
        </label>
        {error && <p className="mb-3 text-sm font-semibold text-rose-700">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">{loading ? "Вход..." : "Войти"}</Button>
      </form>
    </main>
  );
}
