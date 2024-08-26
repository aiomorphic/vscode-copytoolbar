const vscode = require('vscode');
const constants = require('./constants');

class ConfigManager {
    static getConfig(key, defaultValue) {
        return vscode.workspace.getConfiguration(constants.EXTENSION_NAME).get(key, defaultValue);
    }

    static updateConfig(key, value, global = true) {
        return vscode.workspace.getConfiguration(constants.EXTENSION_NAME).update(key, value, global);
    }

    static getShowNotifications() {
        return this.getConfig('showNotifications', constants.DEFAULT_SHOW_NOTIFICATIONS);
    }

    static getMaxDepth() {
        return this.getConfig('maxDepth', constants.DEFAULT_MAX_DEPTH);
    }

    static getFileExtensions() {
        return this.getConfig('fileExtensions', constants.DEFAULT_FILE_EXTENSIONS);
    }

    static getExcludedDirectories() {
        return this.getConfig('excludedDirectories', constants.DEFAULT_EXCLUDED_DIRECTORIES);
    }

    static getEnableWhitespaceRemoval() {
        return this.getConfig('enableWhitespaceRemoval', false);
    }
}

module.exports = ConfigManager;