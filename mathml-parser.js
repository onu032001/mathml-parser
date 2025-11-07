/**
 * Parses MathML Element.
 * @param {MathMLElement} mmlElem MathML element parsed using MathML.
 */
function MathMLElementToJS(mmlElem) {
  let result = '';
  /**
   * Snippet to JavaScript.
   * @param {Node} child Child to iterate.
   */
  const snippetToJS = (child) => {
    if (child.nodeType === 3) return;
    const childName = child.nodeName.toLowerCase();
    switch (childName) {
      case 'mn':
        result += child.textContent;
        break;
      case 'mo':
        if (child.form === 'infix' || child.form === 'postfix') {
          result += child.textContent;
        } else if (child.separator === 'true') {
          result += child.textContent + ' ';
        } else {
          result += ` ${child.textContent} `;
        }
        break;
      case 'mi':
        if (child.textContent === 'π') {
          result += 'Math.PI';
        } else if (child.textContent === 'e') {
          result += 'Math.E';
        } else if (Math[child.textContent]) {
          result += 'Math.' + child.textContent;
        } else {
          result += child.textContent;
        }
        break;
      case 'msup': {
        let childNodesForSup = Array.from(child.childNodes);
        const check = () => {
          if (childNodesForSup.at(-1).nodeType === 3) childNodesForSup.pop();
        }
        check();
        const superscriptElem = childNodesForSup.pop();
        const superscript = MathMLElementToJS(superscriptElem);
        check();
        const baseElem = childNodesForSup.pop();
        const base = MathMLElementToJS(baseElem);
        result += `${base} ** ${superscript}`;
        break;
      }
      case 'mrow':
        result += `(${MathMLElementToJS(child)})`;
        break;
      case 'msqrt': {
        const sqrtInside = MathMLElementToJS(child);
        result += `Math.sqrt(${sqrtInside})`;
        break;
      }
      case 'mroot': {
        let childNodesForRoot = Array.from(child.childNodes);
        const check = () => {
          if (childNodesForRoot.at(-1).nodeType === 3) childNodesForSup.pop();
        }
        check();
        const indexElem = childNodesForRoot.pop();
        const index = MathMLElementToJS(indexElem);
        check();
        const baseElem = childNodesForRoot.pop();
        const base = MathMLElementToJS(baseElem);
        result += `${base} ** (1 / ${index})`;
      }
      default:
        break;
    }
  };
  const childNameOuter = mmlElem.nodeName.toLowerCase();
  if (['math', 'mrow', 'msqrt'].includes(childNameOuter)) {
    const childNodes = Array.from(mmlElem.childNodes);
    childNodes.forEach(snippetToJS);
  } else {
    snippetToJS(mmlElem);
  }
  return result;
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