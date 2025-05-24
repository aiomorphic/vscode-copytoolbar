const EXTENSION_NAME = 'FastPaste';

module.exports = {
    EXTENSION_NAME,

    CMD_COPY_FILE_PATH_CONTENT: 'fastPaste.copyFilePathAndContent',
    CMD_COPY_CURRENT_FILE_PATH_CONTENT: 'fastPaste.copyCurrentFilePathAndContent',
    CMD_COPY_FOLDER_CONTENT: 'fastPaste.copyCurrentFolderPathAndContent',
    CMD_COPY_PROJECT_STRUCTURE: 'fastPaste.copyProjectStructureAST',
    CMD_COPY_JS_PROJECT_STRUCTURE: 'fastPaste.copyJSProjectStructure',
    CMD_COPY_JS_PROJECT_CONTENT: 'fastPaste.copyJSProjectContent',  // New command
    CMD_COPY_MD_DOCS_AND_DOCSTRINGS: 'fastPaste.copyMDDocsAndDocstrings',

    CONFIG_SHOW_NOTIFICATIONS: 'showNotifications',
    CONFIG_MAX_DEPTH: 'maxDepth',
    CONFIG_FILE_EXTENSIONS: 'fileExtensions',
    CONFIG_EXCLUDED_DIRECTORIES: 'excludedDirectories',

    DEFAULT_SHOW_NOTIFICATIONS: true,
    DEFAULT_MAX_DEPTH: 5,
    DEFAULT_FILE_EXTENSIONS: [
        // Python
        '.py', '.pyi', '.pyw',
        // JavaScript/TypeScript
        '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs',
        // Configuration files
        '.json', '.yaml', '.yml', '.toml',
        // Web
        '.html', '.css', '.scss', '.sass', '.less',
        // Documentation
        '.md', '.mdx', '.txt', '.rst',
        // Other languages
        '.php', '.java', '.c', '.cpp', '.cs', '.rb', '.go', '.rs', '.swift', '.kt', '.scala',
        // Shell scripts
        '.sh', '.bash', '.zsh', '.fish',
        // Config files
        '.ini', '.cfg', '.conf', '.env', '.properties',
        // Build files
        '.xml', '.gradle', '.cmake',
        // Vue
        '.vue',
        // Svelte
        '.svelte'
    ],
    DEFAULT_EXCLUDED_DIRECTORIES: [
        'venv', 'node_modules', '__pycache__', 'dist', 'build', 
        '.git', '.svn', '.hg', 
        'coverage', '.nyc_output', 
        '.next', '.nuxt', '.cache',
        'vendor', 'packages', 
        '.idea', '.vscode', '.vs',
        'bin', 'obj', 'out',
        '.pytest_cache', '.tox',
        'bower_components', 'jspm_packages'
    ],
};