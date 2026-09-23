"use server";

import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createSession, destroySession, requireAdmin } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

export type AuthState = { error?: string; ok?: boolean };

// Compared against when the login does not exist, so response time does not reveal valid logins.
const DUMMY_HASH = "$2b$12$x8qYNblMlKAXI4tGRbSgnunJ2GrecGBvVwhN2GTyvkZJ0cGR8V2ju";

export async function login(_prev: AuthState, form: FormData): Promise<AuthState> {
  const ip = ((await headers()).get("x-forwarded-for") || "").split(",")[0].trim() || "local";
  if (!rateLimit(`login:${ip}`, 8, 15 * 60 * 1000)) return { error: "Слишком много попыток. Подождите 15 минут." };

  const loginName = String(form.get("login") || "").trim();
  const password = String(form.get("password") || "");
  if (!loginName || !password) return { error: "Введите логин и пароль" };

  const user = await prisma.adminUser.findUnique({ where: { login: loginName } });
  const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok) return { error: "Неверный логин или пароль" };

  await createSession(user);
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

export async function changePassword(_prev: AuthState, form: FormData): Promise<AuthState> {
  const admin = await requireAdmin();
  const current = String(form.get("current") || "");
  const next = String(form.get("next") || "");
  const repeat = String(form.get("repeat") || "");
  if (next.length < 10) return { error: "Новый пароль — минимум 10 символов" };
  if (next !== repeat) return { error: "Пароли не совпадают" };
  const user = await prisma.adminUser.findUniqueOrThrow({ where: { id: admin.id } });
  if (!(await bcrypt.compare(current, user.passwordHash))) return { error: "Текущий пароль указан неверно" };
  await prisma.adminUser.update({ where: { id: admin.id }, data: { passwordHash: await bcrypt.hash(next, 12) } });
  return { ok: true };
}
