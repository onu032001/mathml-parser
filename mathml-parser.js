/**
 * Parses MathML Element.
 * @param {MathMLElement} mmlElem MathML element parsed using MathML.
 */
function MathMLElementToJS(mmlElem, convertInsideNodes = false) {
  let JSConversionResult = '';
  const inferredRowElements = ['math', 'mrow', 'msqrt', 'mfenced'];
  /**
   * Snippet to JavaScript.
   * @param {Node} child Child to iterate.
   */
  const snippetToJS = (child) => {
    if (child.nodeType === 3) return;
    const childName = child.nodeName.toLowerCase();
    switch (childName) {
      case 'mn': {
        JSConversionResult += child.textContent;
        break;
      }
      case 'mo': {
        if (child.getAttribute('form') === 'prefix' || child.getAttribute('form') === 'postfix') {
          JSConversionResult += child.textContent;
        } else if (child.getAttribute('separator') === 'true') {
          JSConversionResult += child.textContent + ' ';
        } else {
          JSConversionResult += ` ${child.textContent} `;
        }
        break;
      }
      case 'mi': {
        if (child.textContent === 'π') {
          JSConversionResult += 'Math.PI';
        } else if (child.textContent === 'e') {
          JSConversionResult += 'Math.E';
        } else if (Math[child.textContent]) {
          JSConversionResult += 'Math.' + child.textContent;
        } else {
          JSConversionResult += child.textContent;
        }
        break;
      }
      case 'msup': {
        let childNodesInner = Array.from(child.childNodes);
        if (childNodesInner.at(-1).nodeType === 3) childNodesInner.pop();
        const elem2 = childNodesInner.pop();
        const val2 = MathMLElementToJS(elem2, true);
        if (childNodesInner.at(-1).nodeType === 3) childNodesInner.pop();
        const elem1 = childNodesInner.pop();
        const val1 = MathMLElementToJS(elem1, true);
        JSConversionResult += `(${val1} ** ${val2})`;
        break;
      }
      case 'mfrac': {
        let childNodesInner = Array.from(child.childNodes);
        if (childNodesInner.at(-1).nodeType === 3) childNodesInner.pop();
        const elem2 = childNodesInner.pop();
        const val2 = MathMLElementToJS(elem2, true);
        if (childNodesInner.at(-1).nodeType === 3) childNodesInner.pop();
        const elem1 = childNodesInner.pop();
        const val1 = MathMLElementToJS(elem1, true);
        JSConversionResult += `(${val1} / ${val2})`;
        break;
      }
      case 'mfenced':
      case 'mrow': {
        JSConversionResult += `(${MathMLElementToJS(child, false)})`;
        break;
      }
      case 'msqrt': {
        JSConversionResult += `Math.sqrt(${MathMLElementToJS(child, false)})`;
        break;
      }
      case 'mroot': {
        let childNodesInner = Array.from(child.childNodes);
        if (childNodesInner.at(-1).nodeType === 3) childNodesInner.pop();
        const elem2 = childNodesInner.pop();
        const val2 = MathMLElementToJS(elem2, true);
        if (childNodesInner.at(-1).nodeType === 3) childNodesInner.pop();
        const elem1 = childNodesInner.pop();
        const val1 = MathMLElementToJS(elem1, true);
        JSConversionResult += `(${val1} ** (1 / ${val2}))`;
        break;
      }
      default:
        break;
    }
  };
  const childNameOuter = mmlElem.nodeName.toLowerCase();
  if (inferredRowElements.includes(childNameOuter) && !convertInsideNodes) {
    const childNodes = Array.from(mmlElem.childNodes);
    childNodes.forEach(snippetToJS);
  } else {
    snippetToJS(mmlElem);
  }
  return JSConversionResult;
}
function MathMLStringToJS(mml) {
  const parser = new DOMParser();
  let mmlElem = parser.parseFromString(mml, 'text/xml').documentElement;
  const errorElement = mmlElem.querySelector('parsererror');
  if (errorElement) {
    throw new Error(errorElement.innerText);
  }
  return MathMLElementToJS(mmlElem);
}
