import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, rmSync, mkdirSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { tmpdir } from 'os';

import {
  SkillfulPlugin,
  extractAndStripFrontmatter,
  normalizePath,
  parseHandoff,
  validateHandoffTransition,
  readHandoff,
  getCurrentBranch,
} from '../.opencode/plugins/plugin.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const FIXTURES = join(__dirname, 'fixtures');

describe('extractAndStripFrontmatter', () => {
  it('extracts frontmatter and returns body', () => {
    const content = readFileSync(join(FIXTURES, 'with-frontmatter.md'), 'utf8');
    const result = extractAndStripFrontmatter(content);
    assert.deepStrictEqual(result.frontmatter, {
      name: 'test-skill',
      description: 'Use when testing frontmatter parsing',
    });
    assert.match(result.content, /# Test Skill/);
  });

  it('returns content unchanged when no frontmatter', () => {
    const content = readFileSync(join(FIXTURES, 'no-frontmatter.md'), 'utf8');
    const result = extractAndStripFrontmatter(content);
    assert.deepStrictEqual(result.frontmatter, {});
    assert.strictEqual(result.content, content);
  });

  it('handles empty frontmatter (---\\n---)', () => {
    const content = readFileSync(join(FIXTURES, 'empty-frontmatter.md'), 'utf8');
    const result = extractAndStripFrontmatter(content);
    assert.deepStrictEqual(result.frontmatter, {});
    assert.match(result.content, /Body after empty/);
  });

  it('handles BOM prefix before frontmatter', () => {
    const content = readFileSync(join(FIXTURES, 'bom-frontmatter.md'), 'utf8');
    const result = extractAndStripFrontmatter(content);
    assert.strictEqual(result.frontmatter.name, 'bom-skill');
    assert.match(result.content, /Body after BOM/);
  });

  it('handles missing body after frontmatter', () => {
    const content = readFileSync(join(FIXTURES, 'missing-body.md'), 'utf8');
    const result = extractAndStripFrontmatter(content);
    assert.strictEqual(result.frontmatter.name, 'no-body');
    assert.strictEqual(result.content, '');
  });

  it('returns empty frontmatter for empty string', () => {
    const result = extractAndStripFrontmatter('');
    assert.deepStrictEqual(result.frontmatter, {});
    assert.strictEqual(result.content, '');
  });

  it('handles string with only frontmatter delimiters', () => {
    const result = extractAndStripFrontmatter('---\n---\n');
    assert.deepStrictEqual(result.frontmatter, {});
    assert.strictEqual(result.content, '');
  });

  it('strips quotes from YAML values', () => {
    const content = '---\nname: "quoted-name"\ndesc: \'single-quoted\'\n---\nbody';
    const result = extractAndStripFrontmatter(content);
    assert.strictEqual(result.frontmatter.name, 'quoted-name');
    assert.strictEqual(result.frontmatter.desc, 'single-quoted');
  });

  it('handles multi-line values (keeps only first line)', () => {
    const content = '---\ndesc: Use when\n  testing multi-line\n---\nbody';
    const result = extractAndStripFrontmatter(content);
    assert.strictEqual(result.frontmatter.desc, 'Use when');
  });

  it('handles values with colons', () => {
    const content = '---\nname: test:skill\n---\nbody';
    const result = extractAndStripFrontmatter(content);
    assert.strictEqual(result.frontmatter.name, 'test:skill');
  });
});

describe('normalizePath', () => {
  const homeDir = '/home/testuser';

  it('returns null for null input', () => {
    assert.strictEqual(normalizePath(null, homeDir), null);
  });

  it('returns null for undefined input', () => {
    assert.strictEqual(normalizePath(undefined, homeDir), null);
  });

  it('returns null for empty string', () => {
    assert.strictEqual(normalizePath('', homeDir), null);
  });

  it('expands ~/ to home directory', () => {
    const result = normalizePath('~/skillful', homeDir);
    assert.strictEqual(result, resolve(join(homeDir, 'skillful')));
  });

  it('expands bare ~ to home directory', () => {
    const result = normalizePath('~', homeDir);
    assert.strictEqual(result, resolve(homeDir));
  });

  it('resolves absolute paths', () => {
    const result = normalizePath('/absolute/path', homeDir);
    assert.strictEqual(result, resolve('/absolute/path'));
  });

  it('trims trailing whitespace', () => {
    const result = normalizePath('/path/with/space ', homeDir);
    assert.strictEqual(result, resolve('/path/with/space'));
  });

  it('returns null for whitespace-only string', () => {
    assert.strictEqual(normalizePath('   ', homeDir), null);
  });

  it('returns null for non-string input (number)', () => {
    assert.strictEqual(normalizePath(42, homeDir), null);
  });

  it('resolves relative paths against cwd', () => {
    const result = normalizePath('relative/path', homeDir);
    assert.strictEqual(result, resolve('relative/path'));
  });
});

describe('parseHandoff', () => {
  const executingHandoff = `**state:** executing
**Last action:** Completed PR 5
**Current branch:** main`;

  const completeHandoff = `**state:** complete
**Last action:** All PRs done
**Current branch:** feature-x`;

  it('parses state from handoff content', () => {
    const result = parseHandoff(executingHandoff);
    assert.strictEqual(result.state, 'executing');
  });

  it('parses last action from handoff content', () => {
    const result = parseHandoff(executingHandoff);
    assert.strictEqual(result.lastAction, 'Completed PR 5');
  });

  it('parses current branch from handoff content', () => {
    const result = parseHandoff(completeHandoff);
    assert.strictEqual(result.currentBranch, 'feature-x');
  });

  it('parses all fields from full handoff', () => {
    const result = parseHandoff(executingHandoff);
    assert.deepStrictEqual(result, {
      state: 'executing',
      lastAction: 'Completed PR 5',
      currentBranch: 'main',
    });
  });

  it('returns null for empty input', () => {
    assert.strictEqual(parseHandoff(''), null);
  });

  it('returns null for null input', () => {
    assert.strictEqual(parseHandoff(null), null);
  });

  it('returns null for content with no handoff fields', () => {
    assert.strictEqual(parseHandoff('# Just a title'), null);
  });

  it('parses minimal handoff with only state', () => {
    const result = parseHandoff('**state:** design');
    assert.strictEqual(result.state, 'design');
    assert.strictEqual(result.lastAction, undefined);
  });
});

describe('validateHandoffTransition', () => {
  it('allows design to spec', () => {
    assert.deepStrictEqual(validateHandoffTransition('design', 'spec'), { valid: true });
  });

  it('allows spec to plan', () => {
    assert.deepStrictEqual(validateHandoffTransition('spec', 'plan'), { valid: true });
  });

  it('allows plan to executing', () => {
    assert.deepStrictEqual(validateHandoffTransition('plan', 'executing'), { valid: true });
  });

  it('allows executing to review', () => {
    assert.deepStrictEqual(validateHandoffTransition('executing', 'review'), { valid: true });
  });

  it('allows review to complete', () => {
    assert.deepStrictEqual(validateHandoffTransition('review', 'complete'), { valid: true });
  });

  it('allows complete to design (new cycle)', () => {
    assert.deepStrictEqual(validateHandoffTransition('complete', 'design'), { valid: true });
  });

  it('rejects design to executing (skipping spec, plan)', () => {
    const result = validateHandoffTransition('design', 'executing');
    assert.strictEqual(result.valid, false);
    assert.match(result.message, /Invalid transition/);
  });

  it('rejects spec to complete (skipping plan, executing, review)', () => {
    const result = validateHandoffTransition('spec', 'complete');
    assert.strictEqual(result.valid, false);
    assert.match(result.message, /Invalid transition/);
  });

  it('rejects executing to design (going backwards)', () => {
    const result = validateHandoffTransition('executing', 'design');
    assert.strictEqual(result.valid, false);
  });

  it('rejects review to spec (going backwards)', () => {
    const result = validateHandoffTransition('review', 'spec');
    assert.strictEqual(result.valid, false);
  });

  it('allows any transition when no current state', () => {
    assert.deepStrictEqual(validateHandoffTransition(null, 'design'), { valid: true });
    assert.deepStrictEqual(validateHandoffTransition(undefined, 'executing'), { valid: true });
  });

  it('rejects unknown current state', () => {
    const result = validateHandoffTransition('bogus', 'design');
    assert.strictEqual(result.valid, false);
    assert.match(result.message, /Unknown current state/);
  });

  it('rejects unknown next state', () => {
    const result = validateHandoffTransition('design', 'bogus');
    assert.strictEqual(result.valid, false);
    assert.match(result.message, /Unknown next state/);
  });

  it('returns meaningful error message for invalid transition', () => {
    const result = validateHandoffTransition('design', 'complete');
    assert.strictEqual(result.valid, false);
    assert.ok(result.message.includes('spec'));
  });
});

describe('readHandoff', () => {
  let tmpDir;

  before(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'skillful-test-'));
  });

  after(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it('returns null when handoff file does not exist', () => {
    assert.strictEqual(readHandoff(tmpDir), null);
  });

  it('returns null when rootDir is null', () => {
    assert.strictEqual(readHandoff(null), null);
  });

  it('reads and parses handoff file when it exists', () => {
    const skillfulDir = join(tmpDir, '.skillful');
    mkdirSync(skillfulDir);
    writeFileSync(join(skillfulDir, 'handoff.md'), '**state:** design\n**Last action:** Started\n');
    const result = readHandoff(tmpDir);
    assert.strictEqual(result.state, 'design');
    assert.strictEqual(result.lastAction, 'Started');
  });
});

describe('getCurrentBranch', () => {
  it('returns null for directory with no .git', () => {
    const tmpDir = mkdtempSync(join(tmpdir(), 'skillful-test-'));
    assert.strictEqual(getCurrentBranch(tmpDir), null);
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it('returns null for null input', () => {
    assert.strictEqual(getCurrentBranch(null), null);
  });
});

describe('SkillfulPlugin', () => {
  let tmpDir;

  before(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'skillful-test-'));
  });

  after(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it('returns config and transform hooks', async () => {
    const plugin = await SkillfulPlugin({ client: {}, directory: tmpDir });
    assert.ok(plugin.config);
    assert.ok(plugin['experimental.chat.messages.transform']);
  });

  it('registers skills directory in config', async () => {
    const plugin = await SkillfulPlugin({ client: {}, directory: tmpDir });
    const config = {};
    await plugin.config(config);
    assert.ok(config.skills);
    assert.ok(config.skills.paths);
    assert.ok(config.skills.paths.length > 0);
    config.skills.paths.forEach(p => {
      assert.ok(p.endsWith('skills'), `Path ${p} should end with 'skills'`);
    });
  });

  it('injects bootstrap into first user message', async () => {
    const plugin = await SkillfulPlugin({ client: {}, directory: tmpDir });
    const output = {
      messages: [
        {
          info: { role: 'user' },
          parts: [{ type: 'text', text: 'hello' }],
        },
      ],
    };
    await plugin['experimental.chat.messages.transform']({}, output);
    const parts = output.messages[0].parts;
    assert.ok(parts.length > 1);
    assert.match(parts[0].text, /EXTREMELY_IMPORTANT/);
    assert.match(parts[0].text, /You have skillful/);
    assert.match(parts[0].text, /Tool Mapping for OpenCode/);
  });

  it('does not inject bootstrap when already present', async () => {
    const plugin = await SkillfulPlugin({ client: {}, directory: tmpDir });
    const existingBootstrap = '<EXTREMELY_IMPORTANT>already has it</EXTREMELY_IMPORTANT>';
    const output = {
      messages: [
        {
          info: { role: 'user' },
          parts: [
            { type: 'text', text: existingBootstrap },
            { type: 'text', text: 'actual question' },
          ],
        },
      ],
    };
    const partsBefore = output.messages[0].parts.length;
    await plugin['experimental.chat.messages.transform']({}, output);
    assert.strictEqual(output.messages[0].parts.length, partsBefore);
  });

  it('does not modify non-user messages', async () => {
    const plugin = await SkillfulPlugin({ client: {}, directory: tmpDir });
    const output = {
      messages: [
        {
          info: { role: 'assistant' },
          parts: [{ type: 'text', text: 'I can help you build that.' }],
        },
      ],
    };
    await plugin['experimental.chat.messages.transform']({}, output);
    assert.strictEqual(output.messages.length, 1);
    assert.strictEqual(output.messages[0].parts.length, 1);
  });

  it('does nothing when there are no messages', async () => {
    const plugin = await SkillfulPlugin({ client: {}, directory: tmpDir });
    const output = { messages: [] };
    await plugin['experimental.chat.messages.transform']({}, output);
    assert.deepStrictEqual(output, { messages: [] });
  });

  it('exports utility functions for testing', () => {
    assert.ok(typeof extractAndStripFrontmatter === 'function');
    assert.ok(typeof normalizePath === 'function');
    assert.ok(typeof validateHandoffTransition === 'function');
    assert.ok(typeof parseHandoff === 'function');
    assert.ok(typeof readHandoff === 'function');
    assert.ok(typeof getCurrentBranch === 'function');
  });

  it('preserves the original first message text after injection', async () => {
    const plugin = await SkillfulPlugin({ client: {}, directory: tmpDir });
    const originalText = 'hello world';
    const output = {
      messages: [
        {
          info: { role: 'user' },
          parts: [{ type: 'text', text: originalText }],
        },
      ],
    };
    await plugin['experimental.chat.messages.transform']({}, output);
    const texts = output.messages[0].parts.filter(p => p.type === 'text').map(p => p.text);
    assert.ok(texts.some(t => t === originalText));
  });
});
