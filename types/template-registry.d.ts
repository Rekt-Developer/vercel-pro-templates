// types/template-registry.d.ts
export interface TemplateAnalysis {
  name: string;
  owner: string;
  stars: number;
  description: string;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  hasTypescript: boolean;
  hasTests: boolean;
  hasTailwind: boolean;
  lastUpdate: string;
  license: string;
  topics: string[];
}

export interface TemplateRegistry {
  lastUpdated: string;
  templates: TemplateAnalysis[];
  categories: {
    'ui-frameworks': string[];
    typescript: string[];
    tailwind: string[];
    graphql: string[];
  };
}
