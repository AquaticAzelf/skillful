/**
 * Skillful plugin helpers.
 *
 * Kept OUT of .opencode/plugins/ because OpenCode treats every file there as
 * a plugin and calls every exported function as a plugin factory. These are
 * pure utilities imported by the plugin engine and the test suite.
 */

import path from 'path';
import fs from 'fs';

const HANDOFF_STATES = ['design', 'spec', 'plan', 'executing', 'review', 'complete'];

const VALID_TRANSITIONS = {
  design: ['spec'],
  spec: ['plan'],
  plan: ['executing'],
  executing: ['review'],
  review: ['complete'],
  complete: ['design'],
};

const HANDOFF_PATH = '.skillful/handoff.md';

const extractAndStripFrontmatter = (content) => {
  if (!content || typeof content !== 'string') {
    return { frontmatter: {}, content: content || '' };
  }

  const cleaned = content.replace(/^\uFEFF/, '');
  const match = cleaned.match(/^---[\r\n]+([\s\S]*?)(?:\r?\n---|---)[\r\n]*([\s\S]*)$/);
  if (!match) return { frontmatter: {}, content: cleaned };

  const frontmatterStr = match[1].trim();
  const body = match[2];
  const frontmatter = {};

  if (frontmatterStr) {
    for (const line of frontmatterStr.split('\n')) {
      const colonIdx = line.indexOf(':');
      if (colonIdx > 0) {
        const key = line.slice(0, colonIdx).trim();
        const value = line.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '');
        frontmatter[key] = value;
      }
    }
  }

  return { frontmatter, content: body };
};

const parseHandoff = (content) => {
  if (!content || typeof content !== 'string') return null;
  const result = {};
  const stateMatch = content.match(/\*\*state:\*\*\s*(\w+)/);
  if (stateMatch) result.state = stateMatch[1];
  const actionMatch = content.match(/\*\*Last action:\*\*\s*(.+)/);
  if (actionMatch) result.lastAction = actionMatch[1].trim();
  const branchMatch = content.match(/\*\*Current branch:\*\*\s*(\S+)/);
  if (branchMatch) result.currentBranch = branchMatch[1];
  return Object.keys(result).length > 0 ? result : null;
};

const validateHandoffTransition = (currentState, nextState) => {
  if (!currentState) return { valid: true };
  if (!HANDOFF_STATES.includes(currentState)) {
    return { valid: false, message: `Unknown current state: '${currentState}'` };
  }
  if (!HANDOFF_STATES.includes(nextState)) {
    return { valid: false, message: `Unknown next state: '${nextState}'` };
  }
  const allowed = VALID_TRANSITIONS[currentState];
  if (allowed && allowed.includes(nextState)) {
    return { valid: true };
  }
  return {
    valid: false,
    message: `Invalid transition: '${currentState}' \u2192 '${nextState}'. Valid targets: ${(allowed || []).join(', ') || 'none'}`,
  };
};

const readHandoff = (rootDir) => {
  if (!rootDir) return null;
  const handoffFile = path.resolve(rootDir, HANDOFF_PATH);
  try {
    if (!fs.existsSync(handoffFile)) return null;
    const content = fs.readFileSync(handoffFile, 'utf8');
    return parseHandoff(content);
  } catch {
    return null;
  }
};

const getCurrentBranch = (rootDir) => {
  if (!rootDir) return null;
  try {
    const gitDir = path.resolve(rootDir, '.git');
    if (!fs.existsSync(gitDir)) return null;
    const head = fs.readFileSync(path.resolve(gitDir, 'HEAD'), 'utf8').trim();
    const refMatch = head.match(/^ref:\s*refs\/heads\/(\S+)/);
    return refMatch ? refMatch[1] : null;
  } catch {
    return null;
  }
};

const normalizePath = (p, homeDir) => {
  if (!p || typeof p !== 'string') return null;
  let normalized = p.trim();
  if (!normalized) return null;
  if (normalized.startsWith('~/')) {
    normalized = path.join(homeDir, normalized.slice(2));
  } else if (normalized === '~') {
    normalized = homeDir;
  }
  return path.resolve(normalized);
};

export {
  extractAndStripFrontmatter,
  normalizePath,
  parseHandoff,
  validateHandoffTransition,
  readHandoff,
  getCurrentBranch,
};
