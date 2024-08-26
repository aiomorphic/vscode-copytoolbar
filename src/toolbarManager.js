const vscode = require('vscode');
const constants = require('./config/constants');

class ToolbarManager {
    constructor(context) {
        this.context = context;
        this.toolbarItems = [];
        this.createFixedToolbar();
    }
    
createFixedToolbar() {
    const buttons = [
        { name: 'Copy File', icon: 'file', command: constants.CMD_COPY_CURRENT_FILE_PATH_CONTENT },
        { name: 'Copy Folder', icon: 'folder', command: constants.CMD_COPY_FOLDER_CONTENT },
        { name: 'Copy Python Project', icon: 'symbol-structure', command: constants.CMD_COPY_PROJECT_STRUCTURE },
        { name: 'Copy JS Project', icon: 'json', command: constants.CMD_COPY_JS_PROJECT_STRUCTURE },
        { name: 'Copy MD & Docstrings', icon: 'markdown', command: constants.CMD_COPY_MD_DOCS_AND_DOCSTRINGS }
    ];

    buttons.forEach((button, index) => {
        const newButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, index);
        newButton.text = `$(${button.icon}) ${button.name}`;
        newButton.command = button.command;
        newButton.tooltip = `Click to ${button.name}`;
        newButton.show();

        this.toolbarItems.push(newButton);
    });
}


    dispose() {
        this.toolbarItems.forEach(item => item.dispose());
        this.toolbarItems = [];
    }
}

module.exports = ToolbarManager;