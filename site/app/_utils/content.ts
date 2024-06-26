import deepMerge from 'deepmerge';
import { allThemes, allPlayers, allFeatures, allFrameworks } from 'content-collections';
import { Meta } from '@content-collections/core';

const allCollections = {
  themes: allThemes,
  players: allPlayers,
  features: allFeatures,
  frameworks: allFrameworks,
};

type Collections = typeof allCollections;
type CollectionName = keyof Collections;
type CollectionOptions = {
  slug?: string;
  searchParams?: Record<string, string | string[]>;
};

export async function getCollection<K extends CollectionName>(
  name: K,
  options: CollectionOptions = {}
) {
  const collection = allCollections[name as CollectionName];
  return filterCollection(collection, options) as Promise<Collections[K]>;
}

export async function getEntry<K extends CollectionName>(collection: K, slug: string) {
  return (await getCollection(collection, { slug }))[0] as Collections[K][number];
}

export async function getCollectionTagGroups(name: CollectionName) {
  const collection = await getCollection(name);
  const tagGroups = collection.map((item: any) => item.tagGroups).flat();
  return deepMerge.all(tagGroups, {
    arrayMerge: (a, b) => Array.from(new Set([...a, ...b])),
  });
}

function includesIgnoreCase(array: string[], value: string) {
  return array.some((item) => item.toLowerCase() === value.toLowerCase());
}

async function filterCollection<T extends { _meta: Meta }>(
  collection: T[],
  options: CollectionOptions = {}
) {
  const searchParams = options.searchParams || {};

  collection = collection.filter((item: { _meta: Meta }) => {
    if (options.slug && item._meta.path !== options.slug) return false;
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
