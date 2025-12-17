import * as fs from 'fs';
import * as path from 'path';

interface ModuleInfo {
  name: string;
  path: string;
  isGlobal: boolean;
  imports: string[];
  providers: string[];
}

function analyzeModule(filePath: string): ModuleInfo | null {
  const content = fs.readFileSync(filePath, 'utf-8');
  const fileName = path.basename(filePath, '.ts');

  // Проверяем, это модуль?
  if (!content.includes('@Module(')) return null;

  const isGlobal = content.includes('@Global()');

  // Извлекаем imports
  const importsMatch = content.match(/imports:\s*\[([\s\S]*?)\]/);
  const imports: string[] = [];
  if (importsMatch) {
    const importsText = importsMatch[1];
    const moduleMatches = importsText.matchAll(/(\w+Module)/g);
    for (const match of moduleMatches) {
      imports.push(match[1]);
    }
  }

  // Извлекаем providers
  const providersMatch = content.match(/providers:\s*\[([\s\S]*?)\]/);
  const providers: string[] = [];
  if (providersMatch) {
    const providersText = providersMatch[1];
    const providerMatches = providersText.matchAll(/(\w+(?:Service|Adapter|Interactor|Resolver))/g);
    for (const match of providerMatches) {
      providers.push(match[1]);
    }
  }

  return {
    name: fileName,
    path: filePath.replace(path.join(__dirname, '..'), ''),
    isGlobal,
    imports,
    providers,
  };
}

function findAllModules(dir: string): ModuleInfo[] {
  const modules: ModuleInfo[] = [];

  function traverse(currentPath: string) {
    const files = fs.readdirSync(currentPath);

    for (const file of files) {
      const fullPath = path.join(currentPath, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && !file.includes('node_modules')) {
        traverse(fullPath);
      } else if (file.endsWith('.module.ts')) {
        const moduleInfo = analyzeModule(fullPath);
        if (moduleInfo) {
          modules.push(moduleInfo);
        }
      }
    }
  }

  traverse(dir);
  return modules;
}

function buildDependencyGraph(modules: ModuleInfo[]): string {
  let graph = '# Dependency Graph\n\n';
  graph += `**Total modules:** ${modules.length}\n`;
  graph += `**Global modules:** ${modules.filter((m) => m.isGlobal).length}\n`;
  graph += `**Local modules:** ${modules.filter((m) => !m.isGlobal).length}\n\n`;

  // Сначала глобальные модули
  graph += '## 🌍 Global Modules\n\n';
  const globalModules = modules.filter((m) => m.isGlobal).sort((a, b) => a.name.localeCompare(b.name));

  if (globalModules.length === 0) {
    graph += '*No global modules found*\n\n';
  } else {
    for (const mod of globalModules) {
      graph += `### ${mod.name}\n`;
      graph += `**Path:** \`${mod.path}\`\n\n`;
      if (mod.imports.length > 0) {
        graph += `**Imports (${mod.imports.length}):**\n`;
        for (const imp of mod.imports) {
          const imported = modules.find((m) => m.name === imp);
          const isGlobalImport = imported?.isGlobal ? '🌍' : '📦';
          const hasForwardRef = imp.includes('forwardRef') ? ' (forwardRef)' : '';
          graph += `  - ${isGlobalImport} ${imp}${hasForwardRef}\n`;
        }
        graph += '\n';
      }
      if (mod.providers.length > 0) {
        graph += `**Providers (${mod.providers.length}):** ${mod.providers.slice(0, 5).join(', ')}${
          mod.providers.length > 5 ? '...' : ''
        }\n\n`;
      }
      graph += '---\n\n';
    }
  }

  // Потом обычные модули
  graph += '## 📦 Local Modules\n\n';
  const localModules = modules.filter((m) => !m.isGlobal).sort((a, b) => a.name.localeCompare(b.name));

  for (const mod of localModules) {
    graph += `### ${mod.name}\n`;
    graph += `**Path:** \`${mod.path}\`\n\n`;
    if (mod.imports.length > 0) {
      graph += `**Imports (${mod.imports.length}):**\n`;
      for (const imp of mod.imports) {
        const imported = modules.find((m) => m.name === imp);
        const isGlobalImport = imported?.isGlobal ? '🌍' : '📦';
        graph += `  - ${isGlobalImport} ${imp}\n`;
      }
      graph += '\n';
    }
    graph += '---\n\n';
  }

  return graph;
}

function findPotentialCycles(modules: ModuleInfo[]): string {
  let report = '# Potential Circular Dependencies Report\n\n';
  report += `Generated: ${new Date().toLocaleString()}\n\n`;

  let issuesFound = 0;

  // Проверяем глобальные модули, импортирующие не-глобальные
  const globalImportingLocal = modules.filter((m) => {
    if (!m.isGlobal) return false;
    return m.imports.some((imp) => {
      const imported = modules.find((mod) => mod.name === imp);
      return imported && !imported.isGlobal;
    });
  });

  if (globalImportingLocal.length > 0) {
    issuesFound += globalImportingLocal.length;
    report += '## ⚠️ CRITICAL: Global modules importing non-global modules\n\n';
    report += '**This is the most common cause of circular dependencies!**\n\n';
    report += '❌ **Global modules should NOT import non-global modules directly.**\n\n';
    report += '**Solutions:**\n';
    report += '1. Make the imported module also `@Global()`\n';
    report += '2. Use `forwardRef(() => Module)` in imports\n';
    report += '3. Remove the import and inject services with `forwardRef` instead\n\n';

    for (const mod of globalImportingLocal) {
      report += `### ❌ ${mod.name} (@Global)\n`;
      report += `**Path:** \`${mod.path}\`\n\n`;
      const problematicImports = mod.imports.filter((imp) => {
        const imported = modules.find((m) => m.name === imp);
        return imported && !imported.isGlobal;
      });
      report += '**Problematic imports:**\n';
      for (const imp of problematicImports) {
        const imported = modules.find((m) => m.name === imp);
        report += `  - ❌ \`${imp}\` (not global, path: \`${imported?.path}\`)\n`;
      }
      report += '\n';
    }
    report += '---\n\n';
  }

  // Найти модули, которые импортируют один и тот же модуль
  const moduleUsage = new Map<string, string[]>();
  for (const mod of modules) {
    for (const imp of mod.imports) {
      if (!moduleUsage.has(imp)) {
        moduleUsage.set(imp, []);
      }
      moduleUsage.get(imp)!.push(mod.name);
    }
  }

  // Найти модули с высокой связанностью (используются многими)
  const highlyUsedModules = Array.from(moduleUsage.entries())
    .filter(([_, users]) => users.length >= 3)
    .sort((a, b) => b[1].length - a[1].length);

  if (highlyUsedModules.length > 0) {
    report += '## 📊 Highly Coupled Modules (used by 3+ modules)\n\n';
    report += '**These modules are potential bottlenecks for circular dependencies.**\n\n';

    for (const [moduleName, users] of highlyUsedModules) {
      const moduleInfo = modules.find((m) => m.name === moduleName);
      report += `### ${moduleName} ${moduleInfo?.isGlobal ? '🌍' : '📦'}\n`;
      report += `**Used by ${users.length} modules:**\n`;

      const globalUsers = users.filter((u) => {
        const mod = modules.find((m) => m.name === u);
        return mod?.isGlobal;
      });

      const localUsers = users.filter((u) => {
        const mod = modules.find((m) => m.name === u);
        return !mod?.isGlobal;
      });

      if (globalUsers.length > 0) {
        report += `\n**Global importers (${globalUsers.length}):**\n`;
        for (const user of globalUsers) {
          report += `  - 🌍 ${user}\n`;
        }
      }

      if (localUsers.length > 0) {
        report += `\n**Local importers (${localUsers.length}):**\n`;
        for (const user of localUsers.slice(0, 10)) {
          report += `  - 📦 ${user}\n`;
        }
        if (localUsers.length > 10) {
          report += `  - ... and ${localUsers.length - 10} more\n`;
        }
      }

      // Проверяем, есть ли глобальный модуль среди пользователей
      if (globalUsers.length > 0 && !moduleInfo?.isGlobal) {
        issuesFound++;
        report += `\n⚠️ **WARNING:** Non-global module used by global module(s)! Potential circular dependency risk.\n`;
      }

      report += '\n---\n\n';
    }
  }

  // Проверка на отсутствие forwardRef
  const modulesWithoutForwardRef = modules.filter((m) => {
    return m.imports.length > 0 && !m.imports.some((imp) => imp.includes('forwardRef'));
  });

  if (modulesWithoutForwardRef.length > 0) {
    report += '## 💡 Modules without forwardRef\n\n';
    report += `Found ${modulesWithoutForwardRef.length} modules importing other modules without \`forwardRef\`.\n\n`;
    report += 'Consider using `forwardRef(() => Module)` for domain modules that may have circular dependencies.\n\n';
  }

  // Итоговая статистика
  report += '## 📈 Summary\n\n';
  if (issuesFound === 0) {
    report += '✅ **No critical issues found!**\n\n';
  } else {
    report += `❌ **Found ${issuesFound} potential issue(s)**\n\n`;
  }

  report += `- Total modules analyzed: ${modules.length}\n`;
  report += `- Global modules: ${modules.filter((m) => m.isGlobal).length}\n`;
  report += `- Local modules: ${modules.filter((m) => !m.isGlobal).length}\n`;
  report += `- Modules with high coupling: ${highlyUsedModules.length}\n`;

  return report;
}

// Запуск анализа
console.log('🔍 Analyzing NestJS modules...\n');

const srcPath = path.join(__dirname, '..', 'src');
const modules = findAllModules(srcPath);

console.log(`✅ Found ${modules.length} modules`);
console.log(`   - Global: ${modules.filter((m) => m.isGlobal).length}`);
console.log(`   - Local: ${modules.filter((m) => !m.isGlobal).length}\n`);

const graph = buildDependencyGraph(modules);
const graphPath = path.join(__dirname, '..', 'module-dependency-graph.md');
fs.writeFileSync(graphPath, graph);
console.log(`✅ Dependency graph saved to: module-dependency-graph.md`);

const cycles = findPotentialCycles(modules);
const cyclesPath = path.join(__dirname, '..', 'potential-circular-dependencies.md');
fs.writeFileSync(cyclesPath, cycles);
console.log(`✅ Potential cycles analysis saved to: potential-circular-dependencies.md`);

console.log('\n📖 Open these files to see the analysis results!');
