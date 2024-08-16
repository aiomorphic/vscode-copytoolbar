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
