const fs = require('fs').promises;
const path = require('path');
const ignore = require('ignore');
const constants = require('../config/constants');
const ConfigManager = require('../config/configManager');

class FilterUtils {
    constructor() {
        this.excludedDirs = new Set(constants.DEFAULT_EXCLUDED_DIRECTORIES);
        this.gitignorePatterns = null;
        this.allowedExtensions = new Set(constants.DEFAULT_FILE_EXTENSIONS);
    }

    async initialize() {
        const userExcludedDirs = ConfigManager.getExcludedDirectories();
        userExcludedDirs.forEach(dir => this.excludedDirs.add(dir));
        const userFileExtensions = ConfigManager.getFileExtensions();
        this.allowedExtensions = new Set([...constants.DEFAULT_FILE_EXTENSIONS, ...userFileExtensions]);
    }
x
    async loadGitignore(directory) {
        const gitignorePath = path.join(directory, '.gitignore');
        try {
            const gitignoreContent = await fs.readFile(gitignorePath, 'utf-8');
            this.gitignorePatterns = ignore().add(gitignoreContent);
        } catch (err) {
            if (err.code !== 'ENOENT') {
                console.warn(`Unexpected error reading .gitignore: ${err.message}`);
            }
            this.gitignorePatterns = ignore();
        }
    }

    isExcludedDir(dirPath) {
        return dirPath.split(path.sep).some(part => this.excludedDirs.has(part));
    }

    isIgnoredByGitignore(filePath, workspaceRoot) {
        if (!this.gitignorePatterns) return false;
        const relativePath = path.relative(workspaceRoot, filePath);
        return this.gitignorePatterns.ignores(relativePath);
    }

    isAllowedFileExtension(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        return this.allowedExtensions.has(ext);
    }

    shouldIncludeFile(filePath, workspaceRoot) {
        if (this.isExcludedDir(filePath)) return false;
        if (this.isIgnoredByGitignore(filePath, workspaceRoot)) return false;
        if (!this.isAllowedFileExtension(filePath)) return false;
        return true;
    }
}

module.exports = FilterUtils;