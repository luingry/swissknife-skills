import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const skillRoot = path.join(root, 'skills', 'lightweight-windows-app');
const scaffold = path.join(skillRoot, 'assets', 'scaffold');
const read = (...parts) => fs.readFileSync(path.join(skillRoot, ...parts), 'utf8');

function files(directory) {
  return fs.readdirSync(directory, {withFileTypes: true}).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? files(entryPath) : [entryPath];
  });
}

// These assertions protect the published written contract; they do not prove
// that the generated app builds, or any skill activation or model behavior.
test('scripts read as ANSI by Windows PowerShell and Inno Setup stay pure ASCII', () => {
  const targets = files(skillRoot).filter((file) => /\.(ps1|iss)$/.test(file));
  assert.ok(targets.length >= 6);
  for (const file of targets) assert.ok(/^[\x00-\x7F]*$/.test(fs.readFileSync(file, 'utf8')), file);
});

test('the scaffold carries no reusable look', () => {
  const tokens = read('assets', 'scaffold', 'src', '__APP__', 'Theme', 'Tokens.xaml');
  const lines = tokens.split(/\r?\n/).filter((line) => line.includes('x:Key='));
  assert.ok(lines.length > 0);
  for (const line of lines) assert.match(line, /PLACEHOLDER/);
  const installerScript = fs.readFileSync(path.join(scaffold, 'scripts', 'build-installer.ps1'), 'utf8');
  assert.match(installerScript, /PLACEHOLDER/);
  assert.match(installerScript, /throw/);
});

test('the installer template puts the product icon on every surface', () => {
  const installer = read('assets', 'scaffold', 'installer', '__APP__.iss');
  for (const directive of ['SetupIconFile=', 'UninstallDisplayIcon=', 'WizardImageFile=', 'WizardSmallImageFile=', '[Icons]']) {
    assert.ok(installer.includes(directive), directive);
  }
});

test('the generator refuses paths the .NET Framework cannot start from', () => {
  assert.match(read('scripts', 'new-app.ps1'), /exePath\.Length -gt 200/);
});

test('the proof script reads the real registry and files instead of the agent view', () => {
  const proof = read('scripts', 'verify-installed.ps1');
  for (const api of ['StdRegProv', 'CIM_DataFile', 'Win32_Process']) assert.ok(proof.includes(api), api);
});
