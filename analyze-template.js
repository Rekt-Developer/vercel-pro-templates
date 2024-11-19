import { Octokit } from '@octokit/rest';

export async function analyzeRepository(repo, octokit) {
  try {
    const files = await octokit.repos.getContent({
      owner: repo.owner.login,
      repo: repo.name,
      path: '',
    });

    const hasNextConfig = files.data.some((f) => f.name === 'next.config.js');
    const hasPackageJson = files.data.some((f) => f.name === 'package.json');

    if (!hasNextConfig || !hasPackageJson) return null;

    const packageJson = await octokit.repos.getContent({
      owner: repo.owner.login,
      repo: repo.name,
      path: 'package.json',
    });

    const content = JSON.parse(
      Buffer.from(packageJson.data.content, 'base64').toString()
    );

    return {
      name: repo.name,
      owner: repo.owner.login,
      stars: repo.stargazers_count,
      description: repo.description,
      dependencies: content.dependencies || {},
      devDependencies: content.devDependencies || {},
      hasTypescript: files.data.some((f) => f.name === 'tsconfig.json'),
      hasTests: files.data.some(
        (f) => f.name.includes('test') || f.name.includes('jest')
      ),
      hasTailwind: content.dependencies?.['tailwindcss'] || content.devDependencies?.['tailwindcss'],
      lastUpdate: repo.pushed_at,
      license: repo.license?.spdx_id,
      topics: repo.topics || [],
    };
  } catch (error) {
    console.error(`Failed to analyze repository: ${repo.name}`, error.message);
    return null;
  }
}
