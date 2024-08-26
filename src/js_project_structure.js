const fs = require('fs');
const path = require('path');
const babelParser = require('@babel/parser');
const ignore = require('ignore');
const { execSync } = require('child_process');

class CodeAnalyzer {
    constructor(filename) {
        this.filename = filename;
        this.classes = {};
        this.imports = [];
        this.functions = [];
        this.linesOfCode = 0;
    }

    analyzeLinesOfCode(source) {
        this.linesOfCode = source.split(/\r\n|\r|\n/).length;
    }

    analyzeAST(ast) {
        ast.program.body.forEach(node => {
            switch (node.type) {
                case 'ImportDeclaration':
                    this.imports.push(node.source.value);
                    break;
                case 'ClassDeclaration':
                    this._analyzeClass(node);
                    break;
                case 'FunctionDeclaration':
                    this.functions.push(node.id.name);
                    break;
            }
        });
    }

    _analyzeClass(node) {
        const className = node.id.name;
        const classInfo = {
            name: className,
            bases: node.superClass ? [node.superClass.name] : [],
            methods: []
        };

        node.body.body.forEach(method => {
            if (method.type === 'ClassMethod' && method.key.name) {
                classInfo.methods.push(method.key.name);
            }
        });

        this.classes[className] = classInfo;
    }

    static analyzeFile(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const analyzer = new CodeAnalyzer(filePath);
            analyzer.analyzeLinesOfCode(content);
            const ast = babelParser.parse(content, {
                sourceType: 'module',
                plugins: ['jsx', 'typescript']
            });
            analyzer.analyzeAST(ast);
            return analyzer;
        } catch (error) {
            console.error(`Error analyzing file ${filePath}: ${error.message}`);
            return null;
        }
    }

    static formatAnalysis(analyzer, filePath) {
        if (!analyzer) {
            return `Error: Could not analyze ${filePath}\n`;
        }

        let output = [];
        output.push(`File: ${filePath} (Lines: ${analyzer.linesOfCode})`);
        output.push(`  Imports: ${analyzer.imports.join(', ') || 'None'}`);

        for (const [className, classInfo] of Object.entries(analyzer.classes)) {
            output.push(`  Class: ${className}`);
            output.push(`    Inherits: ${classInfo.bases.join(', ') || 'None'}`);
            output.push(`    Methods: ${classInfo.methods.join(', ')}`);
        }

        for (const func of analyzer.functions) {
            output.push(`  Function: ${func}`);
        }

        return output.join('\n');
    }
}

function loadGitignore(directory) {
    const gitignorePath = path.join(directory, '.gitignore');
    if (fs.existsSync(gitignorePath)) {
        const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
        return ignore().add(gitignoreContent);
    }
    return ignore();
}

function getGitInfo(directory) {
    try {
        const branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: directory }).toString().trim();
        const lastCommit = execSync('git log -1 --pretty=%B', { cwd: directory }).toString().trim();
        const author = execSync('git log -1 --pretty=%an', { cwd: directory }).toString().trim();
        return { branch, lastCommit, author };
    } catch (error) {
        console.warn('Could not retrieve Git information.');
        return null;
    }
}

function analyzeDirectory(directory, ig) {
    let results = [];
    let totalLines = 0;
    let totalFiles = 0;
    let modules = {};

    const excludedDirs = new Set(['node_modules', 'dist', 'build', '.git']);

    if (!fs.existsSync(directory)) {
        console.error(`Error: The directory "${directory}" does not exist.`);
        process.exit(1);
    }

    function isExcludedDir(dir) {
        return dir.split(path.sep).some(part => excludedDirs.has(part));
    }

    function isIgnored(filePath) {
        const relativePath = path.relative(directory, filePath);
        return ig.ignores(relativePath);
    }

    function traverseDirectory(subdir) {
        fs.readdirSync(subdir, { withFileTypes: true }).forEach(dirent => {
            const fullPath = path.join(subdir, dirent.name);
            if (isExcludedDir(fullPath) || isIgnored(fullPath)) return;

            if (dirent.isDirectory()) {
                traverseDirectory(fullPath);
            } else if (dirent.isFile() && ['.js', '.ts', '.jsx', '.tsx'].includes(path.extname(dirent.name))) {
                const analyzer = CodeAnalyzer.analyzeFile(fullPath);
                if (analyzer) {
                    totalFiles += 1;
                    totalLines += analyzer.linesOfCode;

                    const relativePath = path.relative(directory, fullPath);
                    const dirName = path.dirname(relativePath);
                    if (!modules[dirName]) {
                        modules[dirName] = {
                            files: [],
                            totalLines: 0,
                            totalFiles: 0,
                        };
                    }

                    modules[dirName].files.push(CodeAnalyzer.formatAnalysis(analyzer, fullPath));
                    modules[dirName].totalLines += analyzer.linesOfCode;
                    modules[dirName].totalFiles += 1;
                }
            }
        });
    }

    traverseDirectory(directory);

    for (let [moduleName, moduleInfo] of Object.entries(modules)) {
        results.push(
            `## Module: ${moduleName}`,
            `  - Total Files: ${moduleInfo.totalFiles}`,
            `  - Total Lines of Code: ${moduleInfo.totalLines}`,
            moduleInfo.files.join('\n')
        );
    }

    if (totalFiles === 0) {
        return { totalFiles, result: '' };
    }

    const projectSummary = [
        `Project Summary:`,
        `  Total Files: ${totalFiles}`,
        `  Total Lines of Code: ${totalLines}`
    ];

    return { 
        totalFiles, 
        result: projectSummary.join('\n') + '\n\n' + results.join('\n')
    };
}

function generateReport(directory) {
    const ig = loadGitignore(directory);
    const gitInfo = getGitInfo(directory);

    const header = [
        `# Project Overview`,
        `- Project Path: ${directory}`,
        `- Programming Languages: JavaScript, TypeScript, JSX, TSX`,
    ];

    if (gitInfo) {
        header.push(`- Git Info: Branch: ${gitInfo.branch}, Last Commit: "${gitInfo.lastCommit}", Author: ${gitInfo.author}`);
    }

    const analysisResult = analyzeDirectory(directory, ig);
    
    if (analysisResult.totalFiles === 0) {
        return header.join('\n') + '\n\nNo JavaScript or TypeScript files found in the project.';
    }

    return header.join('\n') + '\n\n' + analysisResult.result;
}

if (require.main === module) {
    if (process.argv.length !== 3) {
        console.log("Usage: node code_analyzer.js <directory>");
        process.exit(1);
    }

    const directory = process.argv[2];
    const report = generateReport(directory);
    console.log(report);
}