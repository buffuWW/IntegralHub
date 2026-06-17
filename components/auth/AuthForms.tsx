"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button, LinkButton } from "@/components/ui/Button";

export function LoginForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") ?? "/progress";

  async function submit(formData: FormData) {
    setLoading(true);
    setError("");
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: formData.get("email"), password: formData.get("password") })
    });
    const json = await response.json() as { success: boolean; error?: { message: string } };
    setLoading(false);
    if (json.success) window.location.href = returnTo;
    else setError(json.error?.message ?? "Не удалось войти");
  }

  return (
    <form action={submit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm" aria-live="polite">
      <h1 className="mb-5 text-2xl font-black">Вход</h1>
      <label className="mb-3 block"><span className="mb-1 block font-semibold">Электронная почта</span><input name="email" type="email" autoComplete="email" required className="focus-ring w-full rounded-md border border-slate-300 px-3 py-2" /></label>
      <label className="mb-4 block"><span className="mb-1 block font-semibold">Пароль</span><input name="password" type="password" autoComplete="current-password" required className="focus-ring w-full rounded-md border border-slate-300 px-3 py-2" /></label>
      {error && <p className="mb-3 text-sm font-semibold text-rose-700">{error}</p>}
      <Button disabled={loading} className="w-full">{loading ? "Входим..." : "Войти"}</Button>
      <p className="mt-4 text-sm text-slate-600">Нет аккаунта? <a className="font-semibold text-indigo-700" href="/register">Зарегистрироваться</a></p>
    </form>
  );
}

export function RegisterForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(formData: FormData) {
    setLoading(true);
    setError("");
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        displayName: formData.get("displayName"),
        email: formData.get("email"),
        password: formData.get("password"),
        confirmPassword: formData.get("confirmPassword"),
        acceptedTerms: formData.get("acceptedTerms") === "on"
      })
    });
    const json = await response.json() as { success: boolean; error?: { message: string } };
    setLoading(false);
    if (json.success) window.location.href = "/progress";
    else setError(json.error?.message ?? "Не удалось зарегистрироваться");
  }

  return (
    <form action={submit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm" aria-live="polite">
      <h1 className="mb-5 text-2xl font-black">Регистрация</h1>
      <label className="mb-3 block"><span className="mb-1 block font-semibold">Отображаемое имя</span><input name="displayName" minLength={2} maxLength={50} autoComplete="name" className="focus-ring w-full rounded-md border border-slate-300 px-3 py-2" /></label>
      <label className="mb-3 block"><span className="mb-1 block font-semibold">Электронная почта</span><input name="email" type="email" autoComplete="email" required className="focus-ring w-full rounded-md border border-slate-300 px-3 py-2" /></label>
      <label className="mb-3 block"><span className="mb-1 block font-semibold">Пароль</span><input name="password" type="password" autoComplete="new-password" required minLength={8} maxLength={72} className="focus-ring w-full rounded-md border border-slate-300 px-3 py-2" /></label>
      <label className="mb-4 block"><span className="mb-1 block font-semibold">Повтор пароля</span><input name="confirmPassword" type="password" autoComplete="new-password" required minLength={8} maxLength={72} className="focus-ring w-full rounded-md border border-slate-300 px-3 py-2" /></label>
      <label className="mb-4 flex gap-2 text-sm"><input name="acceptedTerms" type="checkbox" required /> <span>Я согласен с правилами использования платформы.</span></label>
      {error && <p className="mb-3 text-sm font-semibold text-rose-700">{error}</p>}
      <Button disabled={loading} className="w-full">{loading ? "Создаём аккаунт..." : "Зарегистрироваться"}</Button>
      <div className="mt-4"><LinkButton href="/login" variant="secondary" className="w-full">Уже есть аккаунт</LinkButton></div>
    </form>
  );
}
