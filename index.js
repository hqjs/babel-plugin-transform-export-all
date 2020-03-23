const isUndefinedOrVoid = (t, node) => t.isIdentifier(node, { name: 'undefined' }) ||
  t.isUnaryExpression(node, { operator: 'void' });

const objectAssign = (t, names, obj = t.objectExpression([])) => t.callExpression(
  t.memberExpression(
    t.identifier('Object'),
    t.identifier('assign')
  ),
  [obj, ...names]
);

const exportDefaultVisitor = (t, found, names, lastExport) => ({
  ExportDefaultDeclaration(nodePath) {
    const { declaration } = nodePath.node;
    if (isUndefinedOrVoid(t, declaration)) return;
    if (nodePath.node.start > lastExport.node.source.start) {
      nodePath.node.declaration = objectAssign(t, names, declaration);
      found.value = true;
      nodePath.stop();
      return;
    } else {
      nodePath.remove();
      lastExport.insertAfter(t.exportDefaultDeclaration(objectAssign(t, names, declaration)));
      found.value = true;
      nodePath.stop();
    }
  }
});

module.exports = function ({ types: t }) {
  const names = [];
  let lastExport = null;
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
        lastExport = nodePath;
      },
      Program: {
        enter() {
          names.length = 0;
          lastExport = null;
        },
        exit(nodePath) {
          if (names.length === 0) return;
          const found = { value: false };
          nodePath.traverse(exportDefaultVisitor(t, found, names, lastExport));
          if (!found.value) {
            nodePath.node.body.push(t.exportDefaultDeclaration(objectAssign(t, names)));
          }
        }
      }
    }
  };
};
