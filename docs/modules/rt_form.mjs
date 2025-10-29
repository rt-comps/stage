// ================================================================
// Functions used used by <rt-orderform> components

//--- findNode
// Search up through DOM to find target node
// If ShadowRoot reached then recurse through enclosing DOM
function findNode(startNode, targetNodeName = 'rt-orderform') {
    // See if targetNode is in this component's 'LightDOM'
    const targetNode = startNode.closest(targetNodeName);

    // If found then return value of query for style node (Null if style node not present)
    if (targetNode !== null) return targetNode
    // If not found BUT root node is ShadowRoot then recurse out of ShadowDOM
    else if (startNode.getRootNode() instanceof ShadowRoot) {
        return findNode(startNode.getRootNode().host, targetNodeName)
    }
    // If not found AND root node is not ShadowRoot then terminate as this means that the tergetNode was not found on this DOM branch!
    else return null;
}

//--- getStyle
// If <style id="<component-name>"> has been defined in the <form-config> section of the data file then
// clone the node into the component's shadow DOM (after the default <style> Node) to override any component defaults.
function getStyle(node, menuNode) {
    // Check that a node
    if (!menuNode) {
        console.log(`getStyle() : ${node.nodeName} did not specify "menuNode"`);
        return
    }    
    // Look for 'menuNode' in the current DOM
    const styleNode = menuNode.querySelector(`form-config style#${node.nodeName.toLowerCase()}`)
    // Apply found style to ShadowDOM
    if (styleNode !== null) {
        // Check if component has an existing style declaration
        const existingStyleNode = node.shadowRoot.querySelector('style');
        // Place 'external style' after existing style declaration
        if (existingStyleNode) existingStyleNode.insertAdjacentElement('afterend', styleNode.cloneNode(true));
        // ... Or place 'external style' before first element
        else node.shadowRoot.childNodes[0].insertAdjacentElement('beforebegin', styleNode.cloneNode(true));
    }    
}    

export { findNode, getStyle };