import { redirect } from "next/navigation";
import { Button, LinkButton } from "@/components/ui/Button";
import { prisma } from "@/lib/prisma";
import { deleteUserSession, requireUserPage } from "@/lib/user-auth";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await requireUserPage("/profile");
  const fullUser = await prisma.user.findUnique({ where: { id: user.id }, select: { email: true, displayName: true, createdAt: true } });
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-5 text-3xl font-black">Профиль</h1>
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p><strong>Имя:</strong> {fullUser?.displayName || "Не указано"}</p>
        <p className="mt-2"><strong>Email:</strong> {fullUser?.email}</p>
        <p className="mt-2"><strong>Дата регистрации:</strong> {fullUser?.createdAt.toLocaleDateString("ru-RU")}</p>
        <form className="mt-5 flex flex-wrap gap-2" action={async (formData) => {
          "use server";
          const { requireUserPage } = await import("@/lib/user-auth");
          const { prisma } = await import("@/lib/prisma");
          const current = await requireUserPage("/profile");
          const displayName = String(formData.get("displayName") ?? "").trim();
          await prisma.user.update({ where: { id: current.id }, data: { displayName: displayName || null } });
        }}>
          <label className="min-w-64 flex-1">
            <span className="mb-1 block font-semibold">Изменить отображаемое имя</span>
            <input name="displayName" defaultValue={fullUser?.displayName ?? ""} minLength={2} maxLength={50} className="focus-ring w-full rounded-md border border-slate-300 px-3 py-2" />
          </label>
          <Button className="self-end">Сохранить имя</Button>
        </form>
        <div className="mt-5 flex flex-wrap gap-3">
          <LinkButton href="/progress">Мой прогресс</LinkButton>
          <LinkButton href="/history" variant="secondary">История</LinkButton>
          <form action={async () => {
            "use server";
            await deleteUserSession();
            redirect("/");
          }}>
            <Button variant="secondary">Выйти</Button>
          </form>
        </div>
      </section>
    </main>
  );
}
