/**
 * Skillful plugin for OpenCode.ai
 *
 * Injects bootstrap context via message transform.
 * Auto-registers skills directory via config hook.
 * Custom build workflow: triage → skills → brainstorm → grill → plan → SDD.
 * Fix workflow: systematic-debugging.
 *
 * NOTE: This module exports ONLY SkillfulPlugin. OpenCode calls every
 * exported function as a plugin factory — additional exports (the helpers
 * used to live here) crashed the server at startup. Helpers live in
 * .opencode/helpers.js.
 */

import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';
import { extractAndStripFrontmatter } from '../helpers.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const log = (msg) => {
  if (process.env.OPENCODE_DEBUG) console.log(`[Skillful] ${msg}`);
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
