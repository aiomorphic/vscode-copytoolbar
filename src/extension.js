const vscode = require('vscode');
const CopyFeatures = require('./copyFeatures');
const ToolbarManager = require('./toolbarManager');
const constants = require('./constants');

let toolbarManager;

function activate(context) {
    console.log('FastPaste is now active!');

    toolbarManager = new ToolbarManager(context);

    context.subscriptions.push(vscode.commands.registerCommand(constants.CMD_COPY_FILE_PATH_CONTENT, async (uri, uris) => {
        if (uris && uris.length > 0) {
            await CopyFeatures.copyMultipleFilesPathAndContent(uris);
        } else if (uri && uri.scheme === 'file') {
            await CopyFeatures.copyFilePathAndContent(uri);
        } else {
            await CopyFeatures.copyFilePathAndContent(undefined);
        }
    }));
    
    context.subscriptions.push(vscode.commands.registerCommand(constants.CMD_COPY_CURRENT_FILE_PATH_CONTENT, async () => {
        await CopyFeatures.copyFilePathAndContent();
    }));

    context.subscriptions.push(vscode.commands.registerCommand(constants.CMD_COPY_FOLDER_CONTENT, async () => {
        await CopyFeatures.copyCurrentFolderPathAndContent();
    }));

    context.subscriptions.push(vscode.commands.registerCommand(constants.CMD_COPY_PROJECT_STRUCTURE, async () => {
        await CopyFeatures.copyProjectStructureAST();
    }));

    context.subscriptions.push(vscode.commands.registerCommand(constants.CMD_COPY_JS_PROJECT_STRUCTURE, async () => {
        await CopyFeatures.copyJSProjectStructure();
    }));

    context.subscriptions.push(vscode.commands.registerCommand(constants.CMD_COPY_MD_DOCS_AND_DOCSTRINGS, async () => {
        await CopyFeatures.copyMDDocsAndDocstrings();
    }));

    console.log('FastPaste activation completed');
}

function deactivate() {
    if (toolbarManager) {
        toolbarManager.dispose();
    }
    console.log('FastPaste deactivated');
}

module.exports = {
    activate,
    deactivate
};