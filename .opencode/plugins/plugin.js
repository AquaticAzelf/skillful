/**
 * Skillful plugin for OpenCode.ai
 *
 * Injects bootstrap context via message transform.
 * Auto-registers skills directory via config hook.
 * Custom build workflow: triage → skills → brainstorm → grill → plan → SDD.
 * Fix workflow: systematic-debugging.
 */

import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const log = (msg) => {
  if (process.env.OPENCODE_DEBUG) console.log(`[Skillful] ${msg}`);
};

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

let _bootstrapCache = undefined;
let _bootstrapMtime = undefined;

export const SkillfulPlugin = async ({ client, directory }) => {
  const homeDir = os.homedir();
  const pluginSkillsDir = path.resolve(__dirname, '../../skills');

  // Priority order for skills: project > user config > plugin
  // We register plugin skills last so project/user overrides win

  const getBootstrapContent = () => {
    const skillPath = path.join(pluginSkillsDir, 'using-skillful', 'SKILL.md');

    try {
      if (!fs.existsSync(skillPath)) {
        _bootstrapCache = null;
        _bootstrapMtime = undefined;
        log('bootstrap SKILL.md not found at ' + skillPath);
        return null;
      }

      const currentMtime = fs.statSync(skillPath).mtimeMs;
      if (_bootstrapCache !== undefined && _bootstrapMtime === currentMtime) {
        return _bootstrapCache;
      }

      const fullContent = fs.readFileSync(skillPath, 'utf8');
      const { content } = extractAndStripFrontmatter(fullContent);

      const toolMapping = `**Tool Mapping for OpenCode:**
When skills request actions, substitute OpenCode equivalents:
- Create or update todos → \`todowrite\`
- \`Subagent (general-purpose):\` → \`task\` with \`subagent_type: "general"\`
- Invoke a skill → OpenCode's native \`skill\` tool
- Read files → \`read\`
- Create, edit, or delete files → \`apply_patch\`
- Run shell commands → \`bash\`
- Search files → \`grep\`, \`glob\`
- Fetch a URL → \`webfetch\`

Use OpenCode's native \`skill\` tool to list and load skills.`;

      _bootstrapCache = `<EXTREMELY_IMPORTANT>
You have skillful.

**IMPORTANT: The bootstrap skill content is included below. It is ALREADY LOADED - you are currently following it. Do NOT use the skill tool to load "using-skillful" again - that would be redundant.**

${content}

${toolMapping}
</EXTREMELY_IMPORTANT>`;

      _bootstrapMtime = currentMtime;
      log('bootstrap cache updated from ' + skillPath);
      return _bootstrapCache;
    } catch (err) {
      log('bootstrap load failed: ' + err.message);
      _bootstrapCache = null;
      _bootstrapMtime = undefined;
      return null;
    }
  };

  return {
    config: async (config) => {
      config.skills = config.skills || {};
      config.skills.paths = config.skills.paths || [];
      if (!config.skills.paths.includes(pluginSkillsDir)) {
        config.skills.paths.push(pluginSkillsDir);
      }
    },

    'experimental.chat.messages.transform': async (_input, output) => {
      const bootstrap = getBootstrapContent();
      if (!bootstrap || !output.messages.length) return;
      const firstUser = output.messages.find(m => m.info.role === 'user');
      if (!firstUser || !firstUser.parts.length) return;

      if (firstUser.parts.some(p => p.type === 'text' && p.text.includes('EXTREMELY_IMPORTANT'))) return;

      const ref = firstUser.parts[0];
      firstUser.parts.unshift({ ...ref, type: 'text', text: bootstrap });
    }
  };
};

// Export for testing
export { extractAndStripFrontmatter, normalizePath, parseHandoff, validateHandoffTransition, readHandoff, getCurrentBranch };
