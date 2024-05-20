
/**
 * A rule that checks, whether a custom:Executor has at least one custom:Product defined in node.product.
 */

function getAugmentedNamespace(n) {
  var f = n.default;
  if (typeof f == "function") {
    var a = function () {
      return f.apply(this, arguments);
    };
    a.prototype = f.prototype;
  } else a = {};
  Object.defineProperty(a, '__esModule', { value: true });
  Object.keys(n).forEach(function (k) {
    var d = Object.getOwnPropertyDescriptor(n, k);
    Object.defineProperty(a, k, d.get ? d : {
      enumerable: true,
      get: function () {
        return n[k];
      }
    });
  });
  return a;
}

function is$d(node, type) {
  if (type.indexOf(':') === -1) {
    type = 'bpmn:' + type;
  }
  return (
    (typeof node.$instanceOf === 'function')
      ? node.$instanceOf(type)
      : node.$type === type
  );
}

function isAny$6(node, types) {
  return types.some(function (type) {
    return is$d(node, type);
  });
}

var index_esm$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  is: is$d,
  isAny: isAny$6
});

var require$$0 = /*@__PURE__*/getAugmentedNamespace(index_esm$1);

const {
  is: is$7
} = require$$0;

export const noProductsDefined = function () {

  function check(node, reporter) {
    if (!is$7(node, 'custom:Executor')) {
      return;
    }

    // Ensure node.product is an array
    const products = Array.isArray(node.product) ? node.product : [];

    // Check if there is at least one 'custom:Product' in node.product
    if (!products.some(product => is$7(product, 'custom:Product'))) {
      reporter.report(node.id, 'No products defined');
    }
  }

  return {
    check
  };
};
