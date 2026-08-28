import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {parseFrontmatter, validateRepository} from '../scripts/validate-repository.mjs';

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'skills-validator-'));
  fs.mkdirSync(path.join(root, 'skills', 'example-skill', 'agents'), {recursive: true});
  fs.writeFileSync(path.join(root, 'skills', 'example-skill', 'SKILL.md'), '---\nname: example-skill\ndescription: Example skill.\n---\n\n# Example\n');
  fs.writeFileSync(path.join(root, 'skills', 'example-skill', 'agents', 'openai.yaml'), 'interface:\n  display_name: "Example"\n  short_description: "Example skill"\n  default_prompt: "Use $example-skill now."\n');
  fs.writeFileSync(path.join(root, 'skills', 'catalog.json'), JSON.stringify({schemaVersion: 1, skills: [{name: 'example-skill', path: 'skills/example-skill', summary: 'Example summary.', portability: 'Example portability.'}]}));
  fs.writeFileSync(path.join(root, 'plugin.json'), JSON.stringify({$schema: 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json', name: 'example', version: '0.1.0', description: 'Example', license: 'MIT'}));
  for (const adapter of ['.codex-plugin', '.claude-plugin']) {
    fs.mkdirSync(path.join(root, adapter));
    fs.writeFileSync(path.join(root, adapter, 'plugin.json'), JSON.stringify({name: 'example', version: '0.1.0', description: 'Example', license: 'MIT', skills: './skills/'}));
  }
  return root;
}

function remove(root) {
  fs.rmSync(root, {recursive: true, force: true});
}

test('accepts a structurally valid minimal collection', (t) => {
  const root = fixture();
  t.after(() => remove(root));
  assert.deepEqual(validateRepository(root), []);
});

test('rejects a description over the Agent Skills limit', (t) => {
  const root = fixture();
  t.after(() => remove(root));
  const skill = path.join(root, 'skills', 'example-skill', 'SKILL.md');
  fs.writeFileSync(skill, `---\nname: example-skill\ndescription: ${'x'.repeat(1025)}\n---\n`);
  assert.match(validateRepository(root).join('\n'), /description exceeds 1024/);
});

test('requires YAML frontmatter to be first content', () => {
  const errors = [];
  assert.equal(parseFrontmatter('# heading\n---\nname: example\n---\n', 'fixture.md', errors), null);
  assert.match(errors.join('\n'), /first content/);
});

test('rejects broken local Markdown links', (t) => {
  const root = fixture();
  t.after(() => remove(root));
  fs.writeFileSync(path.join(root, 'README.md'), '[missing](docs/missing.md)');
  assert.match(validateRepository(root).join('\n'), /local Markdown link does not exist/);
});

test('rejects an out-of-sync or duplicate catalog', (t) => {
  const root = fixture();
  t.after(() => remove(root));
  fs.writeFileSync(path.join(root, 'skills', 'catalog.json'), JSON.stringify({schemaVersion: 1, skills: [
    {name: 'example-skill', path: 'skills/example-skill', summary: 'One', portability: 'One'},
    {name: 'example-skill', path: 'skills/example-skill', summary: 'Two', portability: 'Two'},
  ]}));
  const result = validateRepository(root).join('\n');
  assert.match(result, /catalog skill names do not match/);
  assert.match(result, /duplicate skill names/);
});

test('rejects an OpenAI default prompt that omits the skill name', (t) => {
  const root = fixture();
  t.after(() => remove(root));
  fs.writeFileSync(path.join(root, 'skills', 'example-skill', 'agents', 'openai.yaml'), 'interface:\n  display_name: "Example"\n  short_description: "Example skill"\n  default_prompt: "Use this now."\n');
  assert.match(validateRepository(root).join('\n'), /default_prompt must mention \$example-skill/);
});

test('rejects an adapter with an invalid skills path', (t) => {
  const root = fixture();
  t.after(() => remove(root));
  const manifest = path.join(root, '.claude-plugin', 'plugin.json');
  const data = JSON.parse(fs.readFileSync(manifest, 'utf8'));
  data.skills = './not-skills/';
  fs.writeFileSync(manifest, JSON.stringify(data));
  assert.match(validateRepository(root).join('\n'), /skills must point to \.\/skills\//);
});

test('rejects invalid optional frontmatter types', (t) => {
  const root = fixture();
  t.after(() => remove(root));
  const skill = path.join(root, 'skills', 'example-skill', 'SKILL.md');
  fs.writeFileSync(skill, '---\nname: example-skill\ndescription: Example skill.\ncompatibility: 42\nlicense: false\nallowed-tools: []\nmetadata:\n  label: 42\n---\n');
  const result = validateRepository(root).join('\n');
  assert.match(result, /compatibility must be a non-empty string/);
  assert.match(result, /license must be a non-empty string/);
  assert.match(result, /allowed-tools must be a non-empty string/);
  assert.match(result, /metadata must be a map/);
});

test('accepts a dotted root plugin name with keywords', (t) => {
  const root = fixture();
  t.after(() => remove(root));
  const manifest = path.join(root, 'plugin.json');
  const data = JSON.parse(fs.readFileSync(manifest, 'utf8'));
  data.name = 'example.plugin';
  data.keywords = ['agent-skills', 'cursor'];
  fs.writeFileSync(manifest, JSON.stringify(data));
  assert.deepEqual(validateRepository(root), []);
});

test('rejects unknown root fields and invalid root keywords', (t) => {
  const root = fixture();
  t.after(() => remove(root));
  const manifest = path.join(root, 'plugin.json');
  const data = JSON.parse(fs.readFileSync(manifest, 'utf8'));
  data.unknown = true;
  data.keywords = ['valid', ''];
  fs.writeFileSync(manifest, JSON.stringify(data));
  const result = validateRepository(root).join('\n');
  assert.match(result, /unsupported manifest field unknown/);
  assert.match(result, /keywords must be an array/);
});
