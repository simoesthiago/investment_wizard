'use server';

import { revalidatePath } from 'next/cache';
import { getDb } from '@/lib/db';
import { categorySchema } from '@/lib/validators/category';

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function createCategory(formData: FormData) {
  const raw = {
    name: formData.get('name'),
    icon: formData.get('icon') || null,
    targetAllocation: formData.get('targetAllocation'),
    sortOrder: formData.get('sortOrder') || 0,
  };

  const parsed = categorySchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const db = getDb();
  const slug = slugify(parsed.data.name);

  db.prepare(`
    INSERT INTO categories (name, slug, icon, target_allocation, sort_order)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    parsed.data.name,
    slug,
    parsed.data.icon,
    parsed.data.targetAllocation,
    parsed.data.sortOrder ?? 0,
  );

  revalidatePath('/');
  revalidatePath('/categories');
  revalidatePath('/assets');
  return { success: true };
}

export async function updateCategory(id: number, formData: FormData) {
  const raw = {
    name: formData.get('name'),
    icon: formData.get('icon') || null,
    targetAllocation: formData.get('targetAllocation'),
    sortOrder: formData.get('sortOrder') || 0,
  };

  const parsed = categorySchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const db = getDb();
  const slug = slugify(parsed.data.name);

  db.prepare(`
    UPDATE categories SET name = ?, slug = ?, icon = ?, target_allocation = ?, sort_order = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(
    parsed.data.name,
    slug,
    parsed.data.icon,
    parsed.data.targetAllocation,
    parsed.data.sortOrder ?? 0,
    id,
  );

  revalidatePath('/');
  revalidatePath('/categories');
  revalidatePath('/assets');
  return { success: true };
}

export async function deleteCategory(id: number) {
  const db = getDb();
  db.prepare('DELETE FROM categories WHERE id = ?').run(id);
  revalidatePath('/');
  revalidatePath('/categories');
  revalidatePath('/assets');
  return { success: true };
}
