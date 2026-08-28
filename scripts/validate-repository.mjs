import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseDocument} from 'yaml';

const NAME_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PLUGIN_NAME_RE = /^(?=.{1,64}$)[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/;
const SEMVER_RE = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
const MARKDOWN_LINK_RE = /!?\[[^\]]*\]\(([^)\s]+)(?:\s+[^)]*)?\)/g;

function walk(directory, predicate = () => true) {
  const entries = fs.readdirSync(directory, {withFileTypes: true});
  return entries.flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (!predicate(entryPath, entry)) return [];
    return entry.isDirectory() ? walk(entryPath, predicate) : [entryPath];
  });
}

function isIgnored(entryPath, entry) {
  return !['.git', 'node_modules'].includes(entry.name) && !entryPath.includes(`${path.sep}node_modules${path.sep}`);
}

export function readJson(filePath, errors) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    errors.push(`${filePath}: invalid JSON (${error.message})`);
    return null;
  }
}

export function parseFrontmatter(content, filePath, errors) {
  if (!content.startsWith('---\n') && !content.startsWith('---\r\n')) {
    errors.push(`${filePath}: YAML frontmatter must be the first content`);
    return null;
  }
  const close = /^---\s*$/m.exec(content.slice(4));
  const closeAt = close ? 4 + close.index : -1;
  if (closeAt < 0) {
    errors.push(`${filePath}: YAML frontmatter is not closed`);
    return null;
  }
  const document = parseDocument(content.slice(4, closeAt));
  if (document.errors.length > 0) {
    errors.push(`${filePath}: invalid YAML (${document.errors[0].message})`);
    return null;
  }
  const data = document.toJS();
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    errors.push(`${filePath}: frontmatter must be a mapping`);
    return null;
  }
  return data;
}

function validateSkill(skillPath, errors) {
  const skillMd = path.join(skillPath, 'SKILL.md');
  if (!fs.existsSync(skillMd)) {
    errors.push(`${skillPath}: missing SKILL.md`);
    return null;
  }
  const content = fs.readFileSync(skillMd, 'utf8');
  const metadata = parseFrontmatter(content, skillMd, errors);
  if (!metadata) return null;
  const lines = content.split(/\r?\n/).length;
  if (lines > 500) errors.push(`${skillMd}: has ${lines} lines; repository limit is 500`);
  for (const field of ['name', 'description']) {
    if (typeof metadata[field] !== 'string' || !metadata[field].trim()) {
      errors.push(`${skillMd}: ${field} is required and must be a non-empty string`);
    }
  }
  if (typeof metadata.name === 'string') {
    if (metadata.name.length > 64) errors.push(`${skillMd}: name exceeds 64 characters`);
    if (!NAME_RE.test(metadata.name)) errors.push(`${skillMd}: name must match ${NAME_RE}`);
    if (metadata.name !== path.basename(skillPath)) errors.push(`${skillMd}: name must match folder name`);
  }
  if (typeof metadata.description === 'string' && metadata.description.length > 1024) {
    errors.push(`${skillMd}: description exceeds 1024 characters`);
  }
  if ('compatibility' in metadata) {
    if (typeof metadata.compatibility !== 'string' || !metadata.compatibility.trim()) errors.push(`${skillMd}: compatibility must be a non-empty string`);
    else if (metadata.compatibility.length > 500) errors.push(`${skillMd}: compatibility exceeds 500 characters`);
  }
  if ('license' in metadata && (typeof metadata.license !== 'string' || !metadata.license.trim())) {
    errors.push(`${skillMd}: license must be a non-empty string`);
  }
  if ('allowed-tools' in metadata && (typeof metadata['allowed-tools'] !== 'string' || !metadata['allowed-tools'].trim())) {
    errors.push(`${skillMd}: allowed-tools must be a non-empty string`);
  }
  if ('metadata' in metadata) {
    const pairs = metadata.metadata;
    if (!pairs || typeof pairs !== 'object' || Array.isArray(pairs) || Object.entries(pairs).some(([key, value]) => !key.trim() || typeof value !== 'string')) {
      errors.push(`${skillMd}: metadata must be a map of non-empty string keys to strings`);
    }
  }
  const agentPath = path.join(skillPath, 'agents', 'openai.yaml');
  if (fs.existsSync(agentPath)) {
    const agentDocument = parseDocument(fs.readFileSync(agentPath, 'utf8'));
    if (agentDocument.errors.length > 0) {
      errors.push(`${agentPath}: invalid YAML (${agentDocument.errors[0].message})`);
    } else {
      const agent = agentDocument.toJS();
      const ui = agent?.interface;
      for (const field of ['display_name', 'short_description', 'default_prompt']) {
        if (typeof ui?.[field] !== 'string' || !ui[field].trim()) errors.push(`${agentPath}: interface.${field} is required`);
      }
      if (typeof ui?.default_prompt === 'string' && !ui.default_prompt.includes(`$${metadata.name}`)) {
        errors.push(`${agentPath}: interface.default_prompt must mention $${metadata.name}`);
      }
    }
  }
  return metadata;
}

export function validateMarkdownLinks(root, errors) {
  for (const filePath of walk(root, isIgnored).filter((file) => file.endsWith('.md'))) {
    const content = fs.readFileSync(filePath, 'utf8');
    for (const match of content.matchAll(MARKDOWN_LINK_RE)) {
      const raw = match[1].replace(/^<|>$/g, '');
      if (!raw || raw.startsWith('#') || /^(https?:|mailto:|tel:)/i.test(raw)) continue;
      const target = decodeURIComponent(raw.split('#')[0]);
      if (!target) continue;
      if (!fs.existsSync(path.resolve(path.dirname(filePath), target))) {
        errors.push(`${filePath}: local Markdown link does not exist: ${raw}`);
      }
    }
  }
}

function validatePluginManifest(filePath, errors, options = {}) {
  const manifest = readJson(filePath, errors);
  if (!manifest) return;
  const allowed = options.root
    ? new Set(['$schema', 'name', 'version', 'description', 'author', 'homepage', 'repository', 'license', 'keywords', 'extensions'])
    : new Set(['name', 'version', 'description', 'author', 'homepage', 'repository', 'license', 'keywords', 'skills', 'interface']);
  for (const key of Object.keys(manifest)) {
    if (!allowed.has(key)) errors.push(`${filePath}: unsupported manifest field ${key}`);
  }
  for (const field of ['name', 'version', 'description', 'license']) {
    if (typeof manifest[field] !== 'string' || !manifest[field].trim()) errors.push(`${filePath}: ${field} must be a non-empty string`);
  }
  const namePattern = options.root ? PLUGIN_NAME_RE : NAME_RE;
  if (typeof manifest.name === 'string' && (!namePattern.test(manifest.name) || (options.root && (manifest.name.includes('--') || manifest.name.includes('..'))))) errors.push(`${filePath}: name must match ${namePattern}`);
  if (typeof manifest.version === 'string' && !SEMVER_RE.test(manifest.version)) errors.push(`${filePath}: version must be semantic version`);
  if ('author' in manifest && (!manifest.author || typeof manifest.author !== 'object' || Array.isArray(manifest.author) || typeof manifest.author.name !== 'string' || !manifest.author.name.trim())) {
    errors.push(`${filePath}: author must contain a non-empty name`);
  }
  if ('keywords' in manifest && (!Array.isArray(manifest.keywords) || manifest.keywords.some((item) => typeof item !== 'string' || !item.trim()))) {
    errors.push(`${filePath}: keywords must be an array of non-empty strings`);
  }
  if ('extensions' in manifest && (!manifest.extensions || typeof manifest.extensions !== 'object' || Array.isArray(manifest.extensions))) {
    errors.push(`${filePath}: extensions must be an object`);
  }
  if (options.root) {
    if (manifest.$schema !== 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json') errors.push(`${filePath}: must declare the Agent Plugins 1.0 schema`);
    if ('skills' in manifest) errors.push(`${filePath}: root Agent Plugin manifest must not declare skills`);
  } else if (manifest.skills !== './skills/') {
    errors.push(`${filePath}: skills must point to ./skills/`);
  }
}

export function validateRepository(root) {
  const errors = [];
  const skillsRoot = path.join(root, 'skills');
  if (!fs.existsSync(skillsRoot)) return [`${skillsRoot}: missing skills directory`];
  const skillDirectories = fs.readdirSync(skillsRoot, {withFileTypes: true})
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .map((entry) => path.join(skillsRoot, entry.name));
  const names = new Set();
  for (const directory of skillDirectories) {
    const metadata = validateSkill(directory, errors);
    if (metadata?.name) {
      if (names.has(metadata.name)) errors.push(`${directory}: duplicate skill name ${metadata.name}`);
      names.add(metadata.name);
    }
  }
  const catalogPath = path.join(skillsRoot, 'catalog.json');
  const catalog = readJson(catalogPath, errors);
  if (catalog) {
    if (!Number.isInteger(catalog.schemaVersion)) errors.push(`${catalogPath}: schemaVersion must be an integer`);
    const entries = catalog.skills;
    const catalogNames = entries?.map((skill) => skill?.name);
    if (!Array.isArray(catalogNames)) errors.push(`${catalogPath}: skills must be an array`);
    else {
      const expected = [...names].sort().join('|');
      const received = [...catalogNames].sort().join('|');
      if (expected !== received) errors.push(`${catalogPath}: catalog skill names do not match skill directories`);
      if (new Set(catalogNames).size !== catalogNames.length) errors.push(`${catalogPath}: catalog contains duplicate skill names`);
      for (const skill of entries) {
        if (!skill || typeof skill !== 'object') {
          errors.push(`${catalogPath}: each catalog entry must be an object`);
          continue;
        }
        for (const field of ['name', 'path', 'summary', 'portability']) {
          if (typeof skill[field] !== 'string' || !skill[field].trim()) errors.push(`${catalogPath}: ${field} must be a non-empty string`);
        }
        if (skill.path !== `skills/${skill.name}` || !fs.existsSync(path.join(root, skill.path))) errors.push(`${catalogPath}: ${skill.name} has an invalid canonical path`);
      }
    }
  }
  validateMarkdownLinks(root, errors);
  validatePluginManifest(path.join(root, 'plugin.json'), errors, {root: true});
  validatePluginManifest(path.join(root, '.codex-plugin', 'plugin.json'), errors);
  validatePluginManifest(path.join(root, '.claude-plugin', 'plugin.json'), errors);
  return errors;
}

function main() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const errors = validateRepository(root);
  if (errors.length) {
    console.error(`Repository validation failed (${errors.length} issue(s)):`);
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
  } else {
    console.log('Repository validation passed.');
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
