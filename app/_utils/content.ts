import * as fs from 'fs/promises';
import { join } from 'path';
import deepMerge from 'deepmerge';

import { serialize } from 'next-mdx-remote/serialize'

type CollectionOptions = {
  searchParams?: Record<string, string | string[]>,
};

export async function getCollection(name: string, options: CollectionOptions = {}) {
  const collectionDir = join(process.cwd(), `${name}`);
  const searchParams = options.searchParams || {};

  const slugs = (await fs.readdir(collectionDir))
    .filter((slug) => !slug.startsWith('.'));

  let collection = await Promise.all(slugs.map(async (slug) => {

    const source = await fs.readFile(join(collectionDir, slug, 'index.mdx'), 'utf8');
    const mdxSource = await serialize(source, {
      parseFrontmatter: true,
    });

    return {
      ...mdxSource,
      ...mdxSource.frontmatter,
      slug,
    };
  }));

  collection.sort((a: any, b: any) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  if (searchParams.search) {
    const search = `${searchParams.search}`.toLowerCase();
    return collection.filter((item: any) => {
      return item.title.toLowerCase().includes(search) || item.description.toLowerCase().includes(search);
    });
  }

  for (let [tagGroup, selectedTags] of Object.entries(searchParams)) {
    const selectedTagsArray = Array.isArray(selectedTags) ? selectedTags : [selectedTags];
    collection = collection.filter((item: any) => {
      return selectedTagsArray.some((tag: string) => includesIgnoreCase(item.tagGroups[tagGroup], tag));
    });
  }

  return collection;
}

export async function getCollectionTagGroups(name: string) {
  const collection = await getCollection(name);
  const tagGroups = collection.map((item: any) => item.tagGroups).flat();
  return deepMerge.all(tagGroups, {
    arrayMerge: (a, b) => Array.from(new Set([...a, ...b]))
  });
}

function includesIgnoreCase(array: string[], value: string) {
  return array.some((item) => item.toLowerCase() === value.toLowerCase());
}
