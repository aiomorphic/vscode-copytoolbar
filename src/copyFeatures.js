const vscode = require('vscode');
const path = require('path');
const fs = require('fs').promises;
const { exec } = require('child_process');
const os = require('os');
const ConfigManager = require('./config/configManager');
const constants = require('./config/constants');
const FilterUtils = require('./utils/filterUtils');
const WhitespaceRemover = require('./utils/whitespaceRemover');

class CopyFeatures {
    static async traverseFolderAndCopy(folderPath, workspaceRoot, copyStrings, filterUtils) {
        const entries = await fs.readdir(folderPath, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(folderPath, entry.name);
            
            if (entry.isDirectory()) {
                if (!filterUtils.isExcludedDir(fullPath) && !filterUtils.isIgnoredByGitignore(fullPath, workspaceRoot)) {
                    await this.traverseFolderAndCopy(fullPath, workspaceRoot, copyStrings, filterUtils);
                }
            } else if (entry.isFile() && filterUtils.shouldIncludeFile(fullPath, workspaceRoot)) {
                const normalizedPath = path.relative(workspaceRoot, fullPath).split(path.sep).join('/');
                const fileContent = await fs.readFile(fullPath, 'utf-8');
                const separator = '-'.repeat(50);
                const copyString = `${separator}\n\n/${normalizedPath}:\n\n${separator}\n\n${fileContent}`;
                copyStrings.push(copyString);
                copyStrings.push('\n\n');
            }
        }
    }

    static async copyFilePathAndContent(uri) {
        const editor = vscode.window.activeTextEditor;
        const fileUri = uri || (editor ? editor.document.uri : null);
    
        if (!fileUri) {
            vscode.window.showErrorMessage('No file selected or active editor found.');
            return;
        }
    
        const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        const filterUtils = new FilterUtils();
        await filterUtils.initialize();
        await filterUtils.loadGitignore(workspaceRoot);
        
        if (!filterUtils.shouldIncludeFile(fileUri.fsPath, workspaceRoot)) {
            vscode.window.showInformationMessage('File is excluded by filters.');
            return;
        }
    
        const normalizedPath = path.relative(workspaceRoot, fileUri.fsPath).split(path.sep).join('/');
    
        try {
            let fileContent = await fs.readFile(fileUri.fsPath, 'utf-8');
            
            if (ConfigManager.getEnableWhitespaceRemoval()) {
                fileContent = WhitespaceRemover.removeUnnecessaryWhitespace(fileContent);
            }
            
            const separator = '-'.repeat(50);
            const copyString = `${separator}\n\nFile: ${normalizedPath}\n\n${separator}\n\n${fileContent}`;
    
            await vscode.env.clipboard.writeText(copyString);
            vscode.window.showInformationMessage('File path and content copied to clipboard.');
        } catch (error) {
            console.error('Error in copyFilePathAndContent:', error);
            vscode.window.showErrorMessage(`Error processing file: ${error.message}`);
        }
    }
    
    static async copyProjectStructureAST() {
        const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    
        if (!workspaceRoot) {
            vscode.window.showInformationMessage('No workspace is opened.');
            return;
        }
    
        const pythonScript = path.join(__dirname, 'python', 'project_structure.py');
        const tempFile = path.join(os.tmpdir(), 'project_structure_output.txt');
    
        exec(`python3 ${pythonScript} ${workspaceRoot} > ${tempFile}`, async (err, stdout, stderr) => {
            if (err) {
                vscode.window.showErrorMessage(`Error running Python script: ${stderr}`);
                return;
            }
    
            try {
                const pythonOutput = await fs.readFile(tempFile, 'utf-8');
                if (pythonOutput.includes("No Python files found in the project.")) {
                    vscode.window.showInformationMessage('No Python files found in the project.');
                    return;
                }
    
                await vscode.env.clipboard.writeText(pythonOutput);
                vscode.window.showInformationMessage('Python project structure copied to clipboard.');
            } catch (readErr) {
                vscode.window.showErrorMessage(`Error reading output file: ${readErr.message}`);
            } finally {
                fs.unlink(tempFile).catch(console.error);
            }
        });
    }

    static async copyJSProjectStructure() {
        const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    
        if (!workspaceRoot) {
            vscode.window.showInformationMessage('No workspace is opened.');
            return;
        }
    
        const jsScript = path.join(__dirname, 'js_project_structure.js');
        const tempFile = path.join(os.tmpdir(), 'js_project_structure_output.txt');
    
        exec(`node ${jsScript} ${workspaceRoot} > ${tempFile}`, async (err, stdout, stderr) => {
            if (err) {
                vscode.window.showErrorMessage(`Error running JS script: ${stderr}`);
                return;
            }
    
            try {
                const jsOutput = await fs.readFile(tempFile, 'utf-8');
                if (jsOutput.includes("No JavaScript or TypeScript files found in the project.")) {
                    vscode.window.showInformationMessage('No JavaScript or TypeScript files found in the project.');
                    return;
                }
    
                await vscode.env.clipboard.writeText(jsOutput);
                vscode.window.showInformationMessage('JS Project structure copied to clipboard.');
            } catch (readErr) {
                vscode.window.showErrorMessage(`Error reading output file: ${readErr.message}`);
            } finally {
                fs.unlink(tempFile).catch(console.error);
            }
        });
    }

    static async copyMDDocsAndDocstrings() {
        const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!workspaceRoot) {
            vscode.window.showInformationMessage('No workspace is opened.');
            return;
        }
    
        const filterUtils = new FilterUtils();
        await filterUtils.initialize();
        await filterUtils.loadGitignore(workspaceRoot);
    
        const mdContent = await this.collectMarkdownFiles(workspaceRoot, filterUtils);
        const docstringsContent = await this.extractDocstrings(workspaceRoot, filterUtils);
    
        const combinedContent = [mdContent, docstringsContent].filter(Boolean).join('\n\n');
    
        if (combinedContent.trim() === '') {
            vscode.window.showInformationMessage('No Markdown files or Python docstrings found in the project.');
            return;
        }
    
        await vscode.env.clipboard.writeText(combinedContent);
        vscode.window.showInformationMessage('Markdown docs and Python docstrings content copied to clipboard.');
    }

    static async collectMarkdownFiles(rootPath, filterUtils) {
        const results = [];
    
        async function traverseDirectory(directory) {
            const entries = await fs.readdir(directory, { withFileTypes: true });
    
            for (const entry of entries) {
                const fullPath = path.join(directory, entry.name);
                
                if (filterUtils.isExcludedDir(fullPath) || filterUtils.isIgnoredByGitignore(fullPath, rootPath)) {
                    continue;
                }
    
                if (entry.isDirectory()) {
                    await traverseDirectory(fullPath);
                } else if (entry.isFile() && entry.name.endsWith('.md')) {
                    try {
                        const fileContent = await fs.readFile(fullPath, 'utf-8');
                        const separator = '-'.repeat(23);
                        const relativePath = path.relative(rootPath, fullPath);
                        results.push(`${separator}\n\n/${relativePath}:\n\n${separator}\n\n${fileContent}\n\n`);
                    } catch (err) {
                        vscode.window.showErrorMessage(`Error reading markdown file: ${err.message}`);
                    }
                }
            }
        }

        await traverseDirectory(rootPath);
        return results.join('');
    }


    static async extractDocstrings(workspaceRoot, filterUtils) {
        const pythonScript = path.join(__dirname, 'python', 'copy_docstrings.py');
        const tempFile = path.join(os.tmpdir(), 'docstrings_output.txt');
    
        return new Promise((resolve, reject) => {
            exec(`python3 ${pythonScript} ${workspaceRoot} ${tempFile}`, async (err, stdout, stderr) => {    
                if (err) {
                    vscode.window.showErrorMessage(`Error running Python script: ${stderr}`);
                    reject(err);
                    return;
                }
    
                try {
                    const docstringsOutput = await fs.readFile(tempFile, 'utf-8');
                    if (docstringsOutput.trim() === '') {
                        resolve('');
                    } else {
                        resolve(docstringsOutput);
                    }
                } catch (readErr) {
                    vscode.window.showErrorMessage(`Error reading docstrings output file: ${readErr.message}`);
                    reject(readErr);
                } finally {
                    fs.unlink(tempFile, (unlinkErr) => {
                        if (unlinkErr) console.error(`Error deleting temp file: ${unlinkErr.message}`);
                    });
                }
            });
        });
    }

    static async copyMultipleFilesPathAndContent(uris) {
        const copyStrings = [];
        const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    
        if (!workspaceRoot) {
            this.showNotification('No workspace is opened.', true);
            return;
        }
    
        const filterUtils = new FilterUtils();
        await filterUtils.initialize();
        await filterUtils.loadGitignore(workspaceRoot);
    
        for (const uri of uris) {
            if (filterUtils.shouldIncludeFile(uri.fsPath, workspaceRoot)) {
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

        const filterUtils = new FilterUtils();
        await filterUtils.initialize();
        await filterUtils.loadGitignore(workspaceRoot);

        await this.traverseFolderAndCopy(folderPath, workspaceRoot, copyStrings, filterUtils);

        if (copyStrings.length > 0) {
            await vscode.env.clipboard.writeText(copyStrings.join(''));
            vscode.window.showInformationMessage(`Folder path(s) and content copied to clipboard. ${copyStrings.length} files copied.`);
        } else {
            vscode.window.showInformationMessage('No files found in the folder.');
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
