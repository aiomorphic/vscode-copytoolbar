const EXTENSION_NAME = 'FastPaste';

module.exports = {
    EXTENSION_NAME,

    CMD_COPY_FILE_PATH_CONTENT: 'fastPaste.copyFilePathAndContent',
    CMD_COPY_CURRENT_FILE_PATH_CONTENT: 'fastPaste.copyCurrentFilePathAndContent',
    CMD_COPY_FOLDER_CONTENT: 'fastPaste.copyCurrentFolderPathAndContent',
    CMD_COPY_PROJECT_STRUCTURE: 'fastPaste.copyProjectStructureAST',

    CONFIG_SHOW_NOTIFICATIONS: 'showNotifications',
    CONFIG_MAX_DEPTH: 'maxDepth',
    CONFIG_FILE_EXTENSIONS: 'fileExtensions',
    CONFIG_EXCLUDED_DIRECTORIES: 'excludedDirectories',

    DEFAULT_SHOW_NOTIFICATIONS: true,
    DEFAULT_MAX_DEPTH: 5,
    DEFAULT_FILE_EXTENSIONS: ['.py', '.yaml', '.ini', '.html', '.js', '.css', '.scss', '.md', '.txt'],
    DEFAULT_EXCLUDED_DIRECTORIES: ['venv', 'node_modules', '__pycache__', 'dist', 'build'],
};
