import * as fs from 'fs/promises';
import { join } from 'path';
import { defineCollection, defineConfig } from '@content-collections/core';

type Template = {
  file: string;
  type: string;
  content?: string;
};

const themes = defineCollection({
  name: 'themes',
  directory: 'themes',
  include: '**/*.md',
  schema: (z) => ({
    title: z.string(),
    date: z.number(),
    description: z.string(),
    author: z.string(),
    tagGroups: z.optional(
      z.object({
        media: z.array(z.string()),
        framework: z.array(z.string()),
        features: z.array(z.string()),
      })
    ),
  }),
  transform: async (doc) => {
    const slug = doc._meta.path;
    const packagesDir = join(process.cwd(), '..', 'themes');
    // const source = await fs.readFile(join(packagesDir, slug, 'package.json'), 'utf8');
    // const json = JSON.parse(source);

    const templates = { html: { file: 'template.html', type: 'html' } } as Record<string, Template>;

    for (const [template, options] of Object.entries(templates)) {
      const content = await fs.readFile(join(packagesDir, slug, options.file), 'utf8');
      templates[template].content = content;
    }

    return {
      templates,
      ...doc,
    };
  },
});

const features = defineCollection({
  name: 'features',
  directory: 'features',
  include: '**/*.md',
  schema: (z) => ({
    title: z.string(),
    description: z.string(),
  }),
});

const players = defineCollection({
  name: 'players',
  directory: 'players',
  include: '**/*.md',
  schema: (z) => ({
    title: z.string(),
    description: z.string(),
    tagGroups: z.optional(
      z.object({
        media: z.optional(z.array(z.string())),
        features: z.optional(z.array(z.string())),
      })
    ),
  }),
});

const frameworks = defineCollection({
  name: 'frameworks',
  directory: 'frameworks',
  include: '**/*.md',
  schema: (z) => ({
    title: z.string(),
    description: z.string(),
  }),
});

export default defineConfig({
  collections: [themes, players, features, frameworks],
});
