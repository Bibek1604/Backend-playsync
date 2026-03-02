import { Project, SyntaxKind } from 'ts-morph';
import * as path from 'path';

const project = new Project();
project.addSourceFilesAtPaths("src/__tests__/integration/**/*.ts");

for (const sourceFile of project.getSourceFiles()) {
    let modified = false;

    // Find all call expressions
    const callExpressions = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);

    for (const callExpr of callExpressions) {
        const expression = callExpr.getExpression();
        // Check if expression is a property access expression like 'test.skip'
        if (expression.getKind() === SyntaxKind.PropertyAccessExpression) {
            const text = expression.getText();
            if (text === 'test.skip') {
                // Find the expression statement enclosing this call expression and remove it
                const exprStmt = callExpr.getFirstAncestorByKind(SyntaxKind.ExpressionStatement);
                if (exprStmt) {
                    exprStmt.remove();
                    modified = true;
                }
            }
        }
    }

    if (modified) {
        sourceFile.saveSync();
        console.log(`Removed skipped tests from ${path.basename(sourceFile.getFilePath())}`);
    }
}
console.log("Done");
