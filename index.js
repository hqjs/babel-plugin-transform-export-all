const isUndefinedOrVoid = (t, node) => t.isIdentifier(node, { name: 'undefined' }) ||
  t.isUnaryExpression(node, { operator: 'void' });

const objectAssign = (t, names, obj = t.objectExpression([])) => t.callExpression(
  t.memberExpression(
    t.identifier('Object'),
    t.identifier('assign')
  ),
  [obj, ...names]
);

const exportDefaultVisitor = (t, found, names) => ({
  ExportDefaultDeclaration(nodePath) {
    const { declaration } = nodePath.node;
    if (isUndefinedOrVoid(t, declaration)) return;
    nodePath.node.declaration = objectAssign(t, names, declaration);
    found.value = true;
  }
});

module.exports = function ({ types: t }) {
  const names = [];
  return {
    visitor: {
      ExportAllDeclaration(nodePath) {
        const { source } = nodePath.node;
        const importName = nodePath.scope.generateUidIdentifierBasedOnNode('exportAllDestructure');
        nodePath.replaceWith(t.importDeclaration(
          [t.importNamespaceSpecifier(importName)],
          source
        ));
        names.push(importName);
      },
      Program: {
        enter() {
          names.length = 0;
        },
        exit(nodePath) {
          if (names.length === 0) return;
          const found = { value: false };
          nodePath.traverse(exportDefaultVisitor(t, found, names));
          if (!found.value) {
            nodePath.node.body.push(t.exportDefaultDeclaration(objectAssign(t, names)));
          }
        }
      }
    }
  };
};
