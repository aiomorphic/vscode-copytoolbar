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
