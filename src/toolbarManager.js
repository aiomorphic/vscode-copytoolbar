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
