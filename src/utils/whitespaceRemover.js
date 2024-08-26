const vscode = require('vscode');

class WhitespaceRemover {
    static removeUnnecessaryWhitespace(content) {
        let lines = content.split('\n').map(line => line.trim());
        
        while (lines.length > 0 && lines[0] === '') {
            lines.shift();
        }
        while (lines.length > 0 && lines[lines.length - 1] === '') {
            lines.pop();
        }
        
        let result = [];
        let emptyLineCount = 0;
        for (let line of lines) {
            if (line === '') {
                emptyLineCount++;
                if (emptyLineCount <= 1) {
                    result.push(line);
                }
            } else {
                emptyLineCount = 0;
                result.push(line);
            }
        }
        
        return result.join('\n');
    }
}

module.exports = WhitespaceRemover;