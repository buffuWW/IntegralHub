"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, LinkButton } from "@/components/ui/Button";

type Me = { authenticated: boolean; user: { email: string; displayName: string | null } | null };

export function UserNav({ mobile = false }: { mobile?: boolean }) {
  const [me, setMe] = useState<Me | null>(null);
  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((json: { data: Me }) => setMe(json.data)).catch(() => setMe({ authenticated: false, user: null }));
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  if (!me) return null;
  if (!me.authenticated) {
    return (
      <div className={mobile ? "grid gap-2" : "flex items-center gap-2"}>
        <LinkButton href="/login" variant="secondary" className="min-h-10 px-3">Войти</LinkButton>
        <LinkButton href="/register" className="min-h-10 px-3">Регистрация</LinkButton>
      </div>
    );
  }
  return (
    <div className={mobile ? "grid gap-2" : "flex items-center gap-2"}>
      <span className="text-sm font-semibold text-slate-700">{me.user?.displayName || me.user?.email}</span>
      <Link className="rounded px-2 py-1 font-semibold text-indigo-700" href="/progress">Мой прогресс</Link>
      <Link className="rounded px-2 py-1 font-semibold text-indigo-700" href="/profile">Профиль</Link>
      <Button variant="secondary" className="min-h-10 px-3" onClick={logout}>Выйти</Button>
    </div>
  );
}
