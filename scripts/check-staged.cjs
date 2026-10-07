const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const ts = require('typescript');

let failed = false;
for (const file of process.argv.slice(2)) {
  try {
    const extension = path.extname(file);
    const source = fs.readFileSync(file, 'utf8');
    if (extension === '.json') {
      JSON.parse(source);
    } else if (extension === '.ts' || extension === '.tsx') {
      // Syntax only: staged files may depend on unstaged files or template deps.
      const parsed = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
      if (parsed.parseDiagnostics.length) {
        console.error(ts.formatDiagnosticsWithColorAndContext(parsed.parseDiagnostics, {
          getCanonicalFileName: (name) => name,
          getCurrentDirectory: () => process.cwd(),
          getNewLine: () => '\n',
        }));
        failed = true;
      }
    } else {
      const result = spawnSync(process.execPath, ['--check', file], { stdio: 'inherit' });
      if (result.error) throw result.error;
      if (result.status !== 0) failed = true;
    }
  } catch (error) {
    console.error(`${file}: ${error.message}`);
    failed = true;
  }
}
process.exitCode = failed ? 1 : 0;
