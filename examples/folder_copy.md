When navigating in the Files Explorer, you can select any file within a folder and use the `Copy Folder Content` command (`copyCurrentFolderPathAndContent`) from the toolbar or command palette. This command copies the content of **all code files in the selected folder and its subfolders**.

This feature is particularly useful when you want to provide context about a specific module of your project to a language model (LLM) without including the entire project codebase.

# EXAMPLE

```
--------------------------------------------------

/src/code_analyzer.py:

--------------------------------------------------

import ast
import os

class CodeAnalyzer(ast.NodeVisitor):
    def __init__(self, filename):
        self.filename = filename
        self.classes = {}
        self.imports = []
        self.functions = []
        self.lines_of_code = 0

    def visit_Import(self, node):
        for alias in node.names:
            self.imports.append(alias.name)
        self.generic_visit(node)

    def visit_ImportFrom(self, node):
        module = node.module or ''
        for alias in node.names:
            full_import = f"{module}.{alias.name}"
            self.imports.append(full_import)
        self.generic_visit(node)

    def visit_ClassDef(self, node):
        class_info = {
            "name": node.name,
            "bases": [self._get_base_name(base) for base in node.bases],
            "methods": []
        }
        method_visitor = self.MethodVisitor()
        method_visitor.visit(node)
        class_info["methods"] = method_visitor.methods
        self.classes[node.name] = class_info
        self.generic_visit(node)

    def visit_FunctionDef(self, node):
        if not hasattr(node, 'is_method') or not node.is_method:
            self.functions.append(node.name)
        self.generic_visit(node)

    class MethodVisitor(ast.NodeVisitor):
        def __init__(self):
            self.methods = []

        def visit_FunctionDef(self, node):
            node.is_method = True
            self.methods.append(node.name)

    def _get_base_name(self, base):
        if isinstance(base, ast.Name):
            return base.id
        elif isinstance(base, ast.Attribute):
            return f"{base.value.id}.${base.attr}"
        else:
            return "<unknown base>"

    def analyze_lines_of_code(self, source):
        self.lines_of_code = len(source.splitlines())

def analyze_file(file_path):
    try:
        with open(file_path, "r") as source:
            content = source.read()
            tree = ast.parse(content)
        analyzer = CodeAnalyzer(file_path)
        analyzer.analyze_lines_of_code(content)
        analyzer.visit(tree)
        return analyzer
    except Exception as e:
        print(f"Error analyzing file {file_path}: {str(e)}")
        return None

def format_analysis(analyzer, file_path):
    if analyzer is None:
        return f"Error: Could not analyze {file_path}\n"

    output = []
    output.append(f"File: {file_path} (Lines: {analyzer.lines_of_code})")
    output.append(f"  Imports: {', '.join(analyzer.imports) or 'None'}")

    for class_name, class_info in analyzer.classes.items():
        output.append(f"  Class: {class_name}")
        output.append(f"    Inherits: {', '.join(class_info['bases']) if class_info['bases'] else 'None'}")
        output.append(f"    Methods: {', '.join(class_info['methods'])}")

    for function in analyzer.functions:
        output.append(f"  Function: {function}")

    return '\n'.join(output)

def analyze_directory(directory):
    print(f"Project structure of directory: {directory}")
    results = []
    total_lines = 0
    total_files = 0

    # Directories to exclude
    excluded_dirs = {'venv', 'node_modules', '__pycache__', 'dist', 'build'}

    for subdir, _, files in os.walk(directory):
        # Exclude specific directories
        if any(excluded_dir in subdir.split(os.sep) for excluded_dir in excluded_dirs):
            continue

        for file in files:
            file_path = os.path.join(subdir, file)
            if file.endswith('.py'):
                print(f"Codefile: {file_path}")
                analyzer = analyze_file(file_path)
                if analyzer:
                    total_files += 1
                    total_lines += analyzer.lines_of_code
                    results.append(format_analysis(analyzer, file_path))

    project_summary = (
        f"Project Summary:\n"
        f"  Total Python Files: {total_files}\n"
        f"  Total Lines of Code: {total_lines}\n"
    )
    results.insert(0, project_summary)
    
    return '\n\n'.join(results)

if __name__ == "__main__":
    import sys
    if len(sys.argv) != 2:
        print("Usage: python3 code_analyzer.py <directory>")
        sys.exit(1)
    
    directory = sys.argv[1]
    result = analyze_directory(directory)
    print(result)


--------------------------------------------------

/src/config.js:

--------------------------------------------------

const vscode = require('vscode');
const constants = require('./constants');

class Config {
    static getButtonConfig() {
        const config = vscode.workspace.getConfiguration(constants.EXTENSION_NAME);
        return config.get(constants.CONFIG_BUTTON_CONFIG, constants.DEFAULT_BUTTON_CONFIG);
    }

    static getMaxDepth() {
        const config = vscode.workspace.getConfiguration(constants.EXTENSION_NAME);
        return config.get(constants.CONFIG_MAX_DEPTH, constants.DEFAULT_MAX_DEPTH);
    }
}

module.exports = Config;


--------------------------------------------------

/src/constants.js:

--------------------------------------------------

const EXTENSION_NAME = 'CodeCopyToolbar';

module.exports = {
    EXTENSION_NAME,

    CMD_COPY_FILE_PATH_CONTENT: 'extension.copyFilePathAndContent',
    CMD_COPY_OPEN_TABS_PATH_CONTENT: 'extension.copyOpenTabsPathAndContent',
    CMD_COPY_SELECTED_TAB_PATH_CONTENT: 'extension.copySelectedTabPathAndContent',
    CMD_COPY_CURRENT_FILE_PATH_CONTENT: 'extension.copyCurrentFilePathAndContent',
    CMD_COPY_FOLDER_CONTENT: 'extension.copyCurrentFolderPathAndContent',
    CMD_COPY_PROJECT_STRUCTURE: 'extension.copyProjectStructureAST',
    CMD_REFRESH_TOOLBAR: 'codeCopyToolbar.refreshToolbar',

    CONFIG_BUTTON_CONFIG: 'buttonConfig',

    DEFAULT_BUTTON_CONFIG: [
        {
            name: 'Copy File Path and Content',
            icon: 'copy',
            command_vscode: 'extension.copyCurrentFilePathAndContent',
        },
        {
            name: 'Copy Folder Content',
            icon: 'file-code',
            command_vscode: 'extension.copyCurrentFolderPathAndContent',
        },
        {
            name: 'Copy Project Structure',
            icon: 'code',
            command_vscode: 'extension.copyProjectStructureAST',
        },
    ],

    MAX_DEPTH: 5,
};


--------------------------------------------------

/src/copyFeatures.js:

--------------------------------------------------

const vscode = require('vscode');
const path = require('path');
const fs = require('fs').promises;
const {
    exec
} = require('child_process');
const os = require('os');
const ignore = require('ignore');

class CopyFeatures {
    static async copyFilePathAndContent(fileList) {
        const files = fileList ? (Array.isArray(fileList) ? fileList : [fileList]) : [];

        const [workspaceRoot] = vscode.workspace.workspaceFolders?.map((folder) => folder.uri.fsPath) || [];
        if (!workspaceRoot) {
            vscode.window.showInformationMessage('No workspace is opened.');
            return;
        }

        const copyStrings = await Promise.all(
            files.map(async (fileUri) => {
                const normalizedPath = path.relative(workspaceRoot, fileUri.fsPath).split(path.sep).join('/');
                try {
                    const fileContent = await fs.readFile(fileUri.fsPath, 'utf-8');
                    const separator = '-'.repeat(50);
                    return `${separator}\n\n/${normalizedPath}:\n\n${separator}\n\n${fileContent}`;
                } catch (error) {
                    vscode.window.showErrorMessage(`Error reading file: ${fileUri.fsPath}`);
                    return null;
                }
            })
        );

        const validStrings = copyStrings.filter(Boolean); // Remove nulls
        if (validStrings.length > 0) {
            try {
                await vscode.env.clipboard.writeText(validStrings.join(''));
                vscode.window.showInformationMessage('File path(s) and content copied to clipboard.');
            } catch (error) {
                vscode.window.showErrorMessage('Failed to copy content to clipboard.');
            }
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
        const entries = await fs.readdir(folderPath, {
            withFileTypes: true
        });
        const fileExtensions = ['.py', '.yaml', '.ini', '.html', '.js', '.css', '.scss', '.md', '.txt'];

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
}

module.exports = CopyFeatures;


--------------------------------------------------

/src/extension.js:

--------------------------------------------------

const vscode = require('vscode');
const CopyFeatures = require('./copyFeatures');
const ToolbarManager = require('./toolbarManager');
const constants = require('./constants');

let toolbarManager;

function activate(context) {
    console.log('CodeCopyToolbar is now active!');


    toolbarManager = new ToolbarManager(context);
    console.log('ToolbarManager initialized');


    let disposable = vscode.commands.registerCommand('extension.copyFilePathAndContent', async (uri, uris) => {
        console.log('copyFilePathAndContent called with uri:', uri, 'and uris:', uris);


        if (uris && (!Array.isArray(uris) || uris.length === 0 || typeof uris[0] !== 'object' || !uris[0]
                .path)) {
            uris = [];
        }


        if (uris.length === 0 && uri && uri.path) {
            uris = [uri];
        }

        if (uris.length === 0) {
            console.error('Error: No valid URIs available to copy.');
            vscode.window.showErrorMessage('No valid file paths provided.');
            return;
        }

        await CopyFeatures.copyFilePathAndContent(uris);
    });
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('extension.copyCurrentFolderPathAndContent', async () => {
        await CopyFeatures.copyCurrentFolderPathAndContent();
    });
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('extension.copyProjectStructureAST', async () => {
        await CopyFeatures.copyProjectStructureAST();
    });
    context.subscriptions.push(disposable);

    console.log('CodeCopyToolbar activation completed');
}

function deactivate() {
    if (toolbarManager) {
        toolbarManager.dispose();
    }
}

module.exports = {
    activate,
    deactivate
};


--------------------------------------------------

/src/toolbarManager.js:

--------------------------------------------------

const vscode = require('vscode');
const constants = require('./constants');

class ToolbarManager {
    constructor(context) {
        this.context = context;
        console.log('ToolbarManager constructor called');
        this.updateToolbar();
    }

    updateToolbar() {
        console.log('Updating toolbar');


        const config = vscode.workspace.getConfiguration(constants.EXTENSION_NAME);
        const buttonConfig = config.get('buttonConfig', constants.DEFAULT_BUTTON_CONFIG);
        console.log('Button config:', JSON.stringify(buttonConfig));



        console.log(`Toolbar configuration updated with ${buttonConfig.length} items`);
    }

    dispose() {

    }
}

module.exports = ToolbarManager;


--------------------------------------------------

/src/utils.js:

--------------------------------------------------

const vscode = require('vscode');
const fs = require('fs').promises;
const path = require('path');
const constants = require('./constants');

class Utils {
    static async copyToClipboard(text) {
        await vscode.env.clipboard.writeText(text);
    }

    static async getFolderContent(folderPath, depth = 0) {
        if (depth > constants.MAX_DEPTH) return '';

        let content = '';
        const files = await fs.readdir(folderPath);

        for (const file of files) {
            const filePath = path.join(folderPath, file);
            const stats = await fs.stat(filePath);

            if (stats.isDirectory()) {
                content += `${'  '.repeat(depth)}${file}/\n`;
                content += await this.getFolderContent(filePath, depth + 1);
            } else {
                content += `${'  '.repeat(depth)}${file}\n`;
            }
        }

        return content;
    }

    static async getProjectStructure(rootPath) {
        const structure = await this.getFolderContent(rootPath);
        return `Project Structure:\n${structure}`;
    }
}

module.exports = Utils;
```