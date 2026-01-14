import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    const provider: vscode.DefinitionProvider = {
        provideDefinition(document, position) {
            const range = document.getWordRangeAtPosition(position, /'[^']+'/);
            if (!range) return;

            const word = document.getText(range).replace(/'/g, '');

            if (!document.fileName.endsWith('.vue')) return;

            const workspace = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
            if (!workspace) return;

            // Extract component path from current Vue file
            const componentPath = extractComponentPath(document.fileName, workspace);
            if (!componentPath) return;

            const controllersPath = path.join(workspace, 'app/Http/Controllers');

            const result = findActionInControllers(controllersPath, word, componentPath);
            if (!result) return;

            return new vscode.Location(
                vscode.Uri.file(result.file),
                new vscode.Position(result.line, 0)
            );
        }
    };

    const hoverProvider: vscode.HoverProvider = {
        provideHover(document, position) {
            const range = document.getWordRangeAtPosition(position, /'[^']+'/);
            if (!range) return;

            const word = document.getText(range).replace(/'/g, '');

            if (!document.fileName.endsWith('.vue')) return;

            const workspace = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
            if (!workspace) return;

            // Extract component path from current Vue file
            const componentPath = extractComponentPath(document.fileName, workspace);
            if (!componentPath) return;

            const controllersPath = path.join(workspace, 'app/Http/Controllers');

            const result = findActionInControllers(controllersPath, word, componentPath);
            if (!result) return;

            // Extract method preview from the file
            const preview = extractMethodPreview(result.file, result.line);
            if (!preview) return;

            const markdown = new vscode.MarkdownString();
            markdown.appendCodeblock(preview, 'php');
            markdown.appendMarkdown(`\n\n[Open in ${path.basename(result.file)}](${vscode.Uri.file(result.file).toString()}#${result.line + 1})`);

            return new vscode.Hover(markdown, range);
        }
    };

    context.subscriptions.push(
        vscode.languages.registerDefinitionProvider({ scheme: 'file', language: 'vue' }, provider),
        vscode.languages.registerHoverProvider({ scheme: 'file', language: 'vue' }, hoverProvider)
    );
}

function extractComponentPath(vueFilePath: string, workspace: string): string | null {
    const resourcesPath = path.join(workspace, 'resources/js/pages/');
    if (!vueFilePath.startsWith(resourcesPath)) return null;

    // Remove 'resources/js/pages/' prefix and '.vue' suffix
    let componentPath = vueFilePath.substring(resourcesPath.length);
    componentPath = componentPath.replace(/\.vue$/, '');
    return componentPath;
}

function findActionInControllers(dir: string, action: string, componentPath: string): { file: string, line: number } | null {
    const files = walk(dir);

    for (const file of files) {
        const content = fs.readFileSync(file, 'utf8');
        
        // First filter: Check if method contains 'return $this->responser'
        if (!content.includes('return $this->responser')) {
            continue;
        }

        // Second filter: Check if it has the matching component path
        const componentPattern = new RegExp(`\\$ctx->component\\s*=\\s*fn\\s*\\(\\)\\s*=>\\s*['"]${componentPath.replace(/\//g, '\\/')}['"]`);
        if (!componentPattern.test(content)) {
            continue;
        }

        // Now find the specific action line
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes(`$ctx->${action}`)) {
                return { file, line: i };
            }
        }
    }
    return null;
}

function walk(dir: string): string[] {
    let results: string[] = [];
    const list = fs.readdirSync(dir);

    list.forEach(file => {
        const full = path.join(dir, file);
        const stat = fs.statSync(full);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(full));
        } else if (full.endsWith('.php')) {
            results.push(full);
        }
    });

    return results;
}

function extractMethodPreview(file: string, lineNumber: number): string | null {
    try {
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');

        // Find the method start (look backwards for 'function' or 'public function')
        let startLine = lineNumber;
        for (let i = lineNumber; i >= 0; i--) {
            if (lines[i].match(/\b(public|protected|private)?\s*function\s+\w+/)) {
                startLine = i;
                break;
            }
        }

        // Find the method end (look forward for closing brace at same indentation level)
        let endLine = lineNumber;
        let braceCount = 0;
        let foundStart = false;
        
        for (let i = startLine; i < lines.length; i++) {
            const line = lines[i];
            
            // Count braces
            for (const char of line) {
                if (char === '{') {
                    braceCount++;
                    foundStart = true;
                } else if (char === '}') {
                    braceCount--;
                    if (foundStart && braceCount === 0) {
                        endLine = i;
                        break;
                    }
                }
            }
            
            if (foundStart && braceCount === 0) {
                break;
            }
        }

        // Extract the method (limit to 30 lines for preview)
        const maxLines = 30;
        const actualEndLine = Math.min(endLine, startLine + maxLines - 1);
        const methodLines = lines.slice(startLine, actualEndLine + 1);
        
        let preview = methodLines.join('\n');
        if (actualEndLine < endLine) {
            preview += '\n    // ... method continues ...';
        }

        return preview;
    } catch (error) {
        return null;
    }
}
