import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeSanitize from 'rehype-sanitize';
import { getHighlighter } from 'shiki';

let cachedHighlighter: any;
async function getOrCreateHighlighter() {
  if (!cachedHighlighter) {
    cachedHighlighter = await getHighlighter({ themes: ['github-dark'], langs: ['ts', 'js', 'json', 'bash', 'tsx', 'jsx', 'markdown'] });
  }
  return cachedHighlighter;
}

export async function renderMarkdownToHtml(markdown: string): Promise<string> {
  const highlighter = await getOrCreateHighlighter();
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, {
      allowDangerousHtml: false
    })
    .use(rehypeSanitize)
    .use(rehypeStringify);

  // naive code block highlight by replacing fenced code before processing could be implemented here
  // For simplicity, rely on client-side styles or plain preformatted text; integrated shiki via future rehype plugin if needed
  const result = await processor.process(markdown);
  return String(result);
}


