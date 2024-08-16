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
