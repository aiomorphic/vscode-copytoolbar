module.exports = {
    "env": {
        "node": true,       
        "es2021": true
    },
    "extends": [
        "airbnb-base"
    ],
    "parserOptions": {
        "ecmaVersion": 12,
        "sourceType": "module"
    },
    "rules": {
        "indent": ["error", 4],  
        "eol-last": ["error", "always"],  
        "import/no-unresolved": "off",
    }
};
