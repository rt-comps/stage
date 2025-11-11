function findNode(startNode, targetNodeName = "rt-orderform") {
    const targetNode = startNode.closest(targetNodeName);
    if (targetNode !== null) return targetNode; else if (startNode.getRootNode() instanceof ShadowRoot) {
        return findNode(startNode.getRootNode().host, targetNodeName);
    } else return null;
}

function getStyle(node, menuNode) {
    if (!menuNode) {
        console.log(`getStyle() : ${node.nodeName} did not specify "menuNode"`);
        return;
    }
    const styleNode = menuNode.querySelector(`form-config style#${node.nodeName.toLowerCase()}`);
    if (styleNode !== null) {
        const existingStyleNode = node.shadowRoot.querySelector("style");
        if (existingStyleNode) existingStyleNode.insertAdjacentElement("afterend", styleNode.cloneNode(true)); else node.shadowRoot.childNodes[0].insertAdjacentElement("beforebegin", styleNode.cloneNode(true));
    }
}

export {
    findNode,
    getStyle
};