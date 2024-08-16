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
