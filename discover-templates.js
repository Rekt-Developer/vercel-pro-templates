import { Octokit } from '@octokit/rest';
import { promises as fs } from 'fs';
import { analyzeRepository } from './analyze-template.js';

const MAX_TEMPLATES = parseInt(process.env.MAX_TEMPLATES || 20);
const MIN_STARS = parseInt(process.env.MIN_STARS || 100);

async function discoverTemplates() {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const templates = new Set();

  const searchQueries = [
    'nextjs template stars:>100',
    'next.js starter stars:>100',
    'next.js boilerplate stars:>100',
    'nextjs typescript template stars:>100',
  ];

  for (const query of searchQueries) {
    const result = await octokit.search.repos({
      q: query,
      sort: 'stars',
      per_page: 50,
    });

    for (const repo of result.data.items) {
      if (templates.size >= MAX_TEMPLATES) break;

      const analysis = await analyzeRepository(repo, octokit);
      if (analysis && analysis.stars >= MIN_STARS) {
        templates.add(JSON.stringify(analysis));
      }
    }
  }

  const trending = await octokit.search.repos({
    q: 'nextjs created:>2023-01-01 stars:>500',
    sort: 'stars',
    order: 'desc',
    per_page: 20,
  });

  for (const repo of trending.data.items) {
    if (templates.size >= MAX_TEMPLATES) break;

    const analysis = await analyzeRepository(repo, octokit);
    if (analysis) {
      templates.add(JSON.stringify(analysis));
    }
  }

  return Array.from(templates).map((t) => JSON.parse(t));
}

async function main() {
  const templates = await discoverTemplates();
  await fs.writeFile('template-analysis.json', JSON.stringify(templates, null, 2));
}

main().catch(console.error);
