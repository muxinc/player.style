import { codeToHtml } from 'shiki';

type CodeProps = {
  code: string;
  lang: string;
};

export default async function Code({ code, lang = 'html' }: CodeProps) {
  const html = await codeToHtml(code, {
    lang,
    themes: {
      light: 'github-light',
      dark: 'github-dark',
    },
    transformers: [
      {
        pre(node: any) {
          this.addClassToHast(node, ['p-1', 'font-mono', 'text-sm', 'overflow-x-auto']);
        },
      },
    ],
  });
  return <div className="mb-2" dangerouslySetInnerHTML={{ __html: html }} />;
}
