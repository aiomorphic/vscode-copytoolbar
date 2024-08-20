const vscode = require('vscode');
const path = require('path');
const fs = require('fs').promises;
const {
    exec
} = require('child_process');
const os = require('os');
const ignore = require('ignore');
const ConfigManager = require('./configManager');

class CopyFeatures {
    static async copyFilePathAndContent(uri) {
        const editor = vscode.window.activeTextEditor;
        const fileUri = uri || (editor ? editor.document.uri : null);
    
        if (!fileUri) {
            vscode.window.showErrorMessage('No file selected or active editor found.');
            return;
        }
    
        const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    
        if (!workspaceRoot) {
            vscode.window.showInformationMessage('No workspace is opened.');
            return;
        }
    
        const normalizedPath = path.relative(workspaceRoot, fileUri.fsPath).split(path.sep).join('/');
    
        try {
            const fileContent = await fs.readFile(fileUri.fsPath, 'utf-8');
            const separator = '-'.repeat(50);
            const copyString = `${separator}\n\n/${normalizedPath}:\n\n${separator}\n\n${fileContent}`;
    
            await vscode.env.clipboard.writeText(copyString);
            vscode.window.showInformationMessage('File path and content copied to clipboard.');
        } catch (error) {
            vscode.window.showErrorMessage(`Error reading file: ${fileUri.fsPath}`);
        }
    }
    
    static async copyProjectStructureAST() {
        const editor = vscode.window.activeTextEditor;
        const targetDirectory = editor ?
            path.dirname(editor.document.uri.fsPath) :
            vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

        if (!targetDirectory) {
            vscode.window.showInformationMessage('No workspace is opened.');
            return;
        }

        const pythonScript = path.join(__dirname, 'code_analyzer.py');
        const tempFile = path.join(os.tmpdir(), 'project_structure_output.txt');

        exec(`python3 ${pythonScript} ${targetDirectory} > ${tempFile}`, async (err, stdout, stderr) => {
            if (err) {
                vscode.window.showErrorMessage(`Error running Python script: ${stderr}`);
                return;
            }

            try {
                const pythonOutput = await fs.readFile(tempFile, 'utf-8');
                if (pythonOutput.trim() === '') {
                    vscode.window.showErrorMessage('Python script returned empty output. Nothing to copy.');
                    return;
                }

                const mdFilesContent = await CopyFeatures.collectMarkdownFiles(targetDirectory);
                const combinedOutput = mdFilesContent.trim() ?
                    `${pythonOutput}\n\n# Related Documentation\n${mdFilesContent}` :
                    pythonOutput;

                await vscode.env.clipboard.writeText(combinedOutput);
                vscode.window.showInformationMessage('Project structure and related docs copied to clipboard.');
            } catch (readErr) {
                vscode.window.showErrorMessage(`Error reading output file: ${readErr.message}`);
            }
        });
    }

    static async collectMarkdownFiles(rootPath) {
        const ig = await this.loadGitignore(rootPath);
        const results = [];

        async function traverseDirectory(directory) {
            const entries = await fs.readdir(directory, {
                withFileTypes: true
            });

            await Promise.all(
                entries.map(async (entry) => {
                    const fullPath = path.join(directory, entry.name);
                    if (ig.ignores(path.relative(rootPath, fullPath))) {
                        return;
                    }

                    if (entry.isDirectory()) {
                        await traverseDirectory(fullPath);
                    } else if (entry.isFile() && entry.name.endsWith('.md')) {
                        try {
                            const fileContent = await fs.readFile(fullPath, 'utf-8');
                            results.push(`---\n\n/${path.relative(rootPath, fullPath)}:\n\n${fileContent}\n\n`);
                        } catch (err) {
                            vscode.window.showErrorMessage(`Error reading markdown file: ${err.message}`);
                        }
                    }
                })
            );
        }

        await traverseDirectory(rootPath);
        return results.join('');
    }

    static async loadGitignore(workspaceRoot) {
        const projectRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!projectRoot) {
            vscode.window.showWarningMessage('Could not determine project root.');
            return ignore();
        }

        const gitignorePath = path.join(projectRoot, '.gitignore');
        try {
            const gitignoreContent = await fs.readFile(gitignorePath, 'utf-8');
            return ignore().add(gitignoreContent);
        } catch (err) {
            vscode.window.showWarningMessage(`Could not read .gitignore file: ${err.message}`);
            return ignore();
        }
    }

    static async copyMultipleFilesPathAndContent(uris) {
        const copyStrings = [];
        const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    
        if (!workspaceRoot) {
            this.showNotification('No workspace is opened.', true);
            return;
        }
    
        for (const uri of uris) {
            const normalizedPath = path.relative(workspaceRoot, uri.fsPath).split(path.sep).join('/');
            try {
                const fileContent = await fs.readFile(uri.fsPath, 'utf-8');
                const separator = '-'.repeat(50);
                const copyString = `${separator}\n\n/${normalizedPath}:\n\n${separator}\n\n${fileContent}`;
                copyStrings.push(copyString);
            } catch (error) {
                this.showNotification(`Error reading file: ${uri.fsPath}`, true);
            }
        }
    
        if (copyStrings.length > 0) {
            const combinedContent = copyStrings.join('\n\n');
            await vscode.env.clipboard.writeText(combinedContent);
            this.showNotification(`${copyStrings.length} file(s) copied to clipboard.`);
        } else {
            this.showNotification('No files were copied.', true);
        }
    }                                                   

    static async copyCurrentFolderPathAndContent() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('No active editor found.');
            return;
        }

        const currentFileUri = editor.document.uri;
        const folderPath = path.dirname(currentFileUri.fsPath);

        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showInformationMessage('No workspace is opened.');
            return;
        }

        const workspaceRoot = workspaceFolders[0].uri.fsPath;
        const copyStrings = [];

        const ig = await this.loadGitignore(workspaceRoot);
        await this.traverseFolderAndCopy(folderPath, workspaceRoot, copyStrings, ig);

        if (copyStrings.length > 0) {
            await vscode.env.clipboard.writeText(copyStrings.join(''));
            vscode.window.showInformationMessage('Folder path(s) and content copied to clipboard.');
        } else {
            vscode.window.showInformationMessage('No files found in the folder.');
        }
    }

    static async traverseFolderAndCopy(folderPath, workspaceRoot, copyStrings, ig) {
        const entries = await fs.readdir(folderPath, { withFileTypes: true });
        const fileExtensions = ConfigManager.getFileExtensions();
    
        for (const entry of entries) {
            const fullPath = path.join(folderPath, entry.name);
    
            if (ig.ignores(path.relative(workspaceRoot, fullPath))) {
                continue;
            }
    
            if (entry.isDirectory()) {
                await this.traverseFolderAndCopy(fullPath, workspaceRoot, copyStrings, ig);
            } else if (entry.isFile() && fileExtensions.some((ext) => entry.name.endsWith(ext))) {
                const fileUri = vscode.Uri.file(fullPath);
                const normalizedPath = path.relative(workspaceRoot, fileUri.fsPath).split(path.sep).join('/');
                const fileContent = await fs.readFile(fileUri.fsPath, 'utf-8');
                const separator = '-'.repeat(50);
                const copyString = `${separator}\n\n/${normalizedPath}:\n\n${separator}\n\n${fileContent}`;
                copyStrings.push(copyString);
                copyStrings.push('\n\n');
            }
        }
    }

    static showNotification(message, isError = false) {
        if (ConfigManager.getShowNotifications()) {
            if (isError) {
                vscode.window.showErrorMessage(message);
            } else {
                vscode.window.showInformationMessage(message);
            }
        }
    }
}

module.exports = CopyFeatures;
