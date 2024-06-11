import * as fs from 'fs/promises';
import { join } from 'path';
import deepMerge from 'deepmerge';

type CollectionOptions = {
  slug?: string;
  searchParams?: Record<string, string | string[]>;
};

type Template = {
  file: string;
  type: string;
  content?: string;
};

export async function getCollection(name: string, options: CollectionOptions = {}) {
  const collectionDir = join(process.cwd(), '..', `${name}`);
  const searchParams = options.searchParams || {};

  const slugs = (await fs.readdir(collectionDir)).filter((slug) => {
    if (slug.startsWith('.')) return false;
    if (options.slug && slug !== options.slug) return false;
    return true;
  });

  let collection = await Promise.all(
    slugs.map(async (slug) => {
      const source = await fs.readFile(join(collectionDir, slug, 'package.json'), 'utf8');
      const json = JSON.parse(source);

      const templates = { html: { file: 'template.html', type: 'html' }} as Record<string, Template>;

      for (const [template, options] of Object.entries(templates)) {
        const content = await fs.readFile(join(collectionDir, slug, options.file), 'utf8');
        templates[template].content = content;
      }

      return {
        ...json,
        ...json.extra,
        templates,
        slug,
      };
    })
  );

  collection.sort((a: any, b: any) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  if (searchParams.search) {
    const search = `${searchParams.search}`.toLowerCase();
    return collection.filter((item: any) => {
      return (
        item.title.toLowerCase().includes(search) || item.description.toLowerCase().includes(search)
      );
    });
  }

  for (let [tagGroup, selectedTags] of Object.entries(searchParams)) {
    const selectedTagsArray = Array.isArray(selectedTags) ? selectedTags : [selectedTags];
    collection = collection.filter((item: any) => {
      return selectedTagsArray.some((tag: string) =>
        includesIgnoreCase(item.tagGroups[tagGroup], tag)
      );
    });
  }

  return collection;
}

export async function getEntry(collection: string, slug: string) {
  return (await getCollection(collection, { slug }))[0];
}

export async function getCollectionTagGroups(name: string) {
  const collection = await getCollection(name);
  const tagGroups = collection.map((item: any) => item.tagGroups).flat();
  return deepMerge.all(tagGroups, {
    arrayMerge: (a, b) => Array.from(new Set([...a, ...b])),
  });
}

function includesIgnoreCase(array: string[], value: string) {
  return array.some((item) => item.toLowerCase() === value.toLowerCase());
}
