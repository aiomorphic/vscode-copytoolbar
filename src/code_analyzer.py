import ast
import os

class CodeAnalyzer(ast.NodeVisitor):
    def __init__(self, filename):
        self.filename = filename
        self.classes = {}
        self.imports = []
        self.functions = []
        self.lines_of_code = 0

    def visit_Import(self, node):
        for alias in node.names:
            self.imports.append(alias.name)
        self.generic_visit(node)

    def visit_ImportFrom(self, node):
        module = node.module or ''
        for alias in node.names:
            full_import = f"{module}.{alias.name}"
            self.imports.append(full_import)
        self.generic_visit(node)

    def visit_ClassDef(self, node):
        class_info = {
            "name": node.name,
            "bases": [self._get_base_name(base) for base in node.bases],
            "methods": []
        }
        method_visitor = self.MethodVisitor()
        method_visitor.visit(node)
        class_info["methods"] = method_visitor.methods
        self.classes[node.name] = class_info
        self.generic_visit(node)

    def visit_FunctionDef(self, node):
        if not hasattr(node, 'is_method') or not node.is_method:
            self.functions.append(node.name)
        self.generic_visit(node)

    class MethodVisitor(ast.NodeVisitor):
        def __init__(self):
            self.methods = []

        def visit_FunctionDef(self, node):
            node.is_method = True
            self.methods.append(node.name)

    def _get_base_name(self, base):
        if isinstance(base, ast.Name):
            return base.id
        elif isinstance(base, ast.Attribute):
            return f"{base.value.id}.${base.attr}"
        else:
            return "<unknown base>"

    def analyze_lines_of_code(self, source):
        self.lines_of_code = len(source.splitlines())

def analyze_file(file_path):
    try:
        with open(file_path, "r") as source:
            content = source.read()
            tree = ast.parse(content)
        analyzer = CodeAnalyzer(file_path)
        analyzer.analyze_lines_of_code(content)
        analyzer.visit(tree)
        return analyzer
    except Exception as e:
        print(f"Error analyzing file {file_path}: {str(e)}")
        return None

def format_analysis(analyzer, file_path):
    if analyzer is None:
        return f"Error: Could not analyze {file_path}\n"

    output = []
    output.append(f"File: {file_path} (Lines: {analyzer.lines_of_code})")
    output.append(f"  Imports: {', '.join(analyzer.imports) or 'None'}")

    for class_name, class_info in analyzer.classes.items():
        output.append(f"  Class: {class_name}")
        output.append(f"    Inherits: {', '.join(class_info['bases']) if class_info['bases'] else 'None'}")
        output.append(f"    Methods: {', '.join(class_info['methods'])}")

    for function in analyzer.functions:
        output.append(f"  Function: {function}")

    return '\n'.join(output)

def analyze_directory(directory):
    print(f"Project structure of directory: {directory}")
    results = []
    total_lines = 0
    total_files = 0

    
    excluded_dirs = {'venv', 'node_modules', '__pycache__', 'dist', 'build'}

    for subdir, _, files in os.walk(directory):
        
        if any(excluded_dir in subdir.split(os.sep) for excluded_dir in excluded_dirs):
            continue

        for file in files:
            file_path = os.path.join(subdir, file)
            if file.endswith('.py'):
                print(f"Codefile: {file_path}")
                analyzer = analyze_file(file_path)
                if analyzer:
                    total_files += 1
                    total_lines += analyzer.lines_of_code
                    results.append(format_analysis(analyzer, file_path))

    project_summary = (
        f"Project Summary:\n"
        f"  Total Python Files: {total_files}\n"
        f"  Total Lines of Code: {total_lines}\n"
    )
    results.insert(0, project_summary)
    
    return '\n\n'.join(results)

if __name__ == "__main__":
    import sys
    if len(sys.argv) != 2:
        print("Usage: python3 code_analyzer.py <directory>")
        sys.exit(1)
    
    directory = sys.argv[1]
    result = analyze_directory(directory)
    print(result)
