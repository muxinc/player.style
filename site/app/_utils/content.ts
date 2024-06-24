import deepMerge from 'deepmerge';
import { allThemes } from 'content-collections';

type CollectionOptions = {
  slug?: string;
  searchParams?: Record<string, string | string[]>;
};

export async function getCollection(name: string, options: CollectionOptions = {}) {
  const searchParams = options.searchParams || {};

  let collection;
  switch (name) {
    case 'themes':
      collection = allThemes;
      break;
  }

  if (!collection) throw new Error(`Collection ${name} not found`);

  collection = collection.filter((item) => {
    if (options.slug && item.slug !== options.slug) return false;
    return true;
  });

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
