export type ContentItem = {
  fullPath: string;
  url: string;
  slug: string;
  kind: string;
  data: any;
};

async function fetchJson(url: string) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('fetchJson error', err);
    return null;
  }
}

export async function loadAllContent(): Promise<ContentItem[]> {
  // Use multiple globs so this works both before and after migration
  // @ts-ignore
  const globs = {
    content: (import.meta as any).glob('/src/content/**/*.json', { eager: true, as: 'url' }),
    encounters: (import.meta as any).glob('/src/encounters/**/*.json', { eager: true, as: 'url' }),
    combatants: (import.meta as any).glob('/src/combatants/**/*.json', { eager: true, as: 'url' }),
  };

  const entries: { fullPath: string; url: string }[] = [];
  Object.values(globs).forEach((g: Record<string, string>) => {
    Object.entries(g).forEach(([fullPath, url]) => {
      entries.push({ fullPath, url: url as string });
    });
  });

  // Deduplicate by URL
  const byUrl = new Map<string, string>();
  entries.forEach(e => { if (!byUrl.has(e.url)) byUrl.set(e.url, e.fullPath); });

  const items: ContentItem[] = [];
  await Promise.all(Array.from(byUrl.entries()).map(async ([url, fullPath]) => {
    const data = await fetchJson(url);
    if (!data) return;
    // infer slug and kind
    const parts = fullPath.split('/');
    const fileName = parts[parts.length - 1] || '';
    const slug = data.slug || fileName.replace(/\.json$/i, '');
    let kind = data.kind || '';
    if (!kind) {
      if (fullPath.includes('/combatants/') || fullPath.includes('/content/combatants')) kind = 'combatant';
      else if (fullPath.includes('/encounters/') || fullPath.includes('/content/encounters')) kind = 'encounter';
      else kind = 'unknown';
    }
    items.push({ fullPath, url, slug, kind, data });
  }));

  // Deduplicate by slug, preferring files under /src/content when collisions occur
  const bySlug = new Map<string, ContentItem>();
  items.forEach(item => {
    const existing = bySlug.get(item.slug);
    if (!existing) {
      bySlug.set(item.slug, item);
      return;
    }
    // prefer content folder
    const existingIsContent = existing.fullPath.includes('/src/content/');
    const itemIsContent = item.fullPath.includes('/src/content/');
    if (existingIsContent && !itemIsContent) return; // keep existing
    if (!existingIsContent && itemIsContent) {
      bySlug.set(item.slug, item);
      return;
    }
    // otherwise keep the first seen
  });

  return Array.from(bySlug.values());
}

export async function findBySlug(kind: string, slug: string) {
  const items = await loadAllContent();
  return items.find(i => i.kind === kind && (i.slug === slug || i.fullPath.endsWith(`${slug}.json`)));
}
