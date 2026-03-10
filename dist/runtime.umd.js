/*!
 * Tela Runtime v0.1.2
 * https://github.com/tela-lang/tela
 * MIT License
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.Tela = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
class TelaRuntime {
  constructor() {
    this.components = {};
    this._stores = {};
  }

  // --- Global Store ---

  store(name, initialState = {}) {
    if (this._stores[name]) return this._stores[name].proxy;
    const subscribers = new Set();
    const proxy = new Proxy({ ...initialState }, {
      set: (target, key, value) => {
        if (target[key] === value) return true;
        target[key] = value;
        for (const update of subscribers) update();
        return true;
      }
    });
    this._stores[name] = { proxy, subscribers };
    return proxy;
  }

  subscribeStore(name, updateFn) {
    if (!this._stores[name]) return;
    this._stores[name].subscribers.add(updateFn);
  }

  unsubscribeStore(name, updateFn) {
    if (!this._stores[name]) return;
    this._stores[name].subscribers.delete(updateFn);
  }

  // --- Route Pattern Matching ---

  matchRoute(patterns, pathname) {
    for (const pattern of patterns) {
      const params = this._testPattern(pattern, pathname);
      if (params !== null) return { pattern, params };
    }
    return { pattern: pathname, params: {} };
  }

  _testPattern(pattern, pathname) {
    const patParts = pattern.split('/').filter(Boolean);
    const urlParts = pathname.split('/').filter(Boolean);
    if (patParts.length !== urlParts.length) return null;
    const params = {};
    for (let i = 0; i < patParts.length; i++) {
      if (patParts[i].startsWith(':')) {
        params[patParts[i].slice(1)] = decodeURIComponent(urlParts[i]);
      } else if (patParts[i] !== urlParts[i]) {
        return null;
      }
    }
    return params;
  }

  defineComponent(config) {
    return config;
  }

  reactive(initialState, onUpdate, watchers = {}) {
    return new Proxy(initialState, {
      set: (target, key, value) => {
        target[key] = value;
        if (watchers[key]) watchers[key]();
        if (onUpdate) onUpdate();
        return true;
      }
    });
  }

  element(tag, attributes = {}, children = []) {
    return { tag, attributes, children };
  }

  // --- Public API ---

  render(ComponentDef, container) {
    container.innerHTML = '';

    const instance = {
      props: {},
      _componentDef: ComponentDef,
      _childInstances: [],
      _childCursor: 0,
      update: () => this._rerenderInstance(instance, container)
    };

    const renderFn = ComponentDef.setup(instance);
    instance.renderFn = renderFn;

    // Initial render
    instance._childCursor = 0;
    const vdom = instance.renderFn();
    const dom = this.createDOM(vdom, instance);
    container.appendChild(dom);
    instance._vdom = vdom;
    instance._mounted = true;

    if (ComponentDef.onMount) ComponentDef.onMount();
  }

  // --- Instance re-render (incremental) ---

  _rerenderInstance(instance, container) {
    if (!instance.renderFn) return;
    instance._childCursor = 0;
    const newVdom = instance.renderFn();

    // Patch the container's children (root vdom is a single node)
    const oldChildren = instance._vdom ? [instance._vdom] : [];
    const newChildren = [newVdom];
    this._patchChildren(container, oldChildren, newChildren, instance);

    instance._vdom = newVdom;

    if (instance._componentDef && instance._componentDef.onUpdate) {
      instance._componentDef.onUpdate();
    }
  }

  // --- Child component mount/reuse ---

  mountChildComponent(vnode, parentInstance) {
    const ComponentDef = vnode.tag;
    const props = vnode.attributes || {};

    const idx = parentInstance ? (parentInstance._childCursor++) : -1;
    const cache = parentInstance ? (parentInstance._childInstances || []) : [];
    const existing = cache[idx];

    // Reuse same component type: update props and patch
    if (existing && existing._componentDef === ComponentDef) {
      existing.props = props;
      existing._childCursor = 0;
      const newVdom = existing.renderFn();

      // Patch existing DOM
      const oldChildren = existing._vdom ? [existing._vdom] : [];
      const newChildren = [newVdom];
      if (existing._domContainer) {
        this._patchChildren(existing._domContainer, oldChildren, newChildren, existing);
      }
      existing._vdom = newVdom;

      return existing._domContainer || this.createDOM(newVdom, existing);
    }

    // New child instance
    const instance = {
      props,
      _componentDef: ComponentDef,
      _childInstances: [],
      _childCursor: 0,
    };

    // Give child its own container div for patching
    const domContainer = document.createElement('tela-child');
    domContainer.style.display = 'contents'; // transparent wrapper
    instance._domContainer = domContainer;

    instance.update = () => {
      if (!instance.renderFn) return;
      instance._childCursor = 0;
      const newVdom = instance.renderFn();
      const oldChildren = instance._vdom ? [instance._vdom] : [];
      this._patchChildren(domContainer, oldChildren, [newVdom], instance);
      instance._vdom = newVdom;
      if (instance._componentDef && instance._componentDef.onUpdate) {
        instance._componentDef.onUpdate();
      }
    };

    if (parentInstance) cache[idx] = instance;

    const renderFn = ComponentDef.setup(instance);
    instance.renderFn = renderFn;

    instance._childCursor = 0;
    const childVdom = instance.renderFn();
    const childDom = this.createDOM(childVdom, instance);
    domContainer.appendChild(childDom);
    instance._vdom = childVdom;
    instance._mounted = true;

    if (ComponentDef.onMount) ComponentDef.onMount();

    return domContainer;
  }

  // --- DOM creation (initial render) ---

  createDOM(vnode, parentInstance = null) {
    if (Array.isArray(vnode)) {
      const fragment = document.createDocumentFragment();
      this.normalizeChildren(vnode).forEach(child => {
        fragment.appendChild(this.createDOM(child, parentInstance));
      });
      return fragment;
    }

    if (typeof vnode === 'string' || typeof vnode === 'number') {
      return document.createTextNode(String(vnode));
    }

    if (typeof vnode.tag === 'object' && vnode.tag !== null && vnode.tag.setup) {
      return this.mountChildComponent(vnode, parentInstance);
    }

    const el = document.createElement(vnode.tag);
    this._applyAttributes(el, vnode.attributes || {});

    this.normalizeChildren(vnode.children || []).forEach(child => {
      el.appendChild(this.createDOM(child, parentInstance));
    });

    return el;
  }

  // Apply all attributes to a fresh element
  _applyAttributes(el, attrs) {
    Object.entries(attrs).forEach(([key, value]) => {
      if (key.startsWith('on') && typeof value === 'function') {
        const eventName = key.toLowerCase().substring(2);
        el.addEventListener(eventName, value);
        if (!el._telaListeners) el._telaListeners = {};
        el._telaListeners[key] = value;
      } else if (key === 'style' && typeof value === 'object') {
        Object.entries(value).forEach(([k, v]) => { el.style[k] = v; });
      } else {
        el.setAttribute(key, value);
      }
    });
  }

  // --- Incremental patching ---

  // Patch a single DOM node against old/new vnodes.
  // Returns the (possibly replaced) DOM node.
  _patchNode(parentEl, domNode, oldVnode, newVnode, instance) {
    // New vnode is absent — remove old DOM node
    if (newVnode == null) {
      if (domNode) parentEl.removeChild(domNode);
      return null;
    }

    // No old vnode — create and append
    if (oldVnode == null) {
      const newDom = this.createDOM(newVnode, instance);
      parentEl.appendChild(newDom);
      return newDom;
    }

    // Both are text/numbers
    const newIsText = typeof newVnode === 'string' || typeof newVnode === 'number';
    const oldIsText = typeof oldVnode === 'string' || typeof oldVnode === 'number';

    if (newIsText && oldIsText) {
      if (String(oldVnode) !== String(newVnode)) {
        domNode.textContent = String(newVnode);
      }
      return domNode;
    }

    // Type mismatch (text↔element) — replace
    if (newIsText !== oldIsText) {
      const newDom = this.createDOM(newVnode, instance);
      parentEl.replaceChild(newDom, domNode);
      return newDom;
    }

    // Both are vnodes — check if component
    const newIsComponent = typeof newVnode.tag === 'object' && newVnode.tag !== null && newVnode.tag.setup;
    const oldIsComponent = typeof oldVnode.tag === 'object' && oldVnode.tag !== null && oldVnode.tag.setup;

    if (newIsComponent || oldIsComponent) {
      // Delegate to mountChildComponent (handles reuse internally via cursor)
      const newDom = this.mountChildComponent(newVnode, instance);
      if (newDom !== domNode) {
        parentEl.replaceChild(newDom, domNode);
      }
      return newDom;
    }

    // Different element tags — replace entirely
    if (oldVnode.tag !== newVnode.tag) {
      const newDom = this.createDOM(newVnode, instance);
      parentEl.replaceChild(newDom, domNode);
      return newDom;
    }

    // Same element tag — patch in place
    this._patchAttributes(domNode, oldVnode.attributes || {}, newVnode.attributes || {});
    this._patchChildren(
      domNode,
      oldVnode.children || [],
      newVnode.children || [],
      instance
    );

    return domNode;
  }

  // Diff and patch attributes on an existing element
  _patchAttributes(el, oldAttrs, newAttrs) {
    const allKeys = new Set([...Object.keys(oldAttrs), ...Object.keys(newAttrs)]);

    for (const key of allKeys) {
      const oldVal = oldAttrs[key];
      const newVal = newAttrs[key];

      if (oldVal === newVal) continue;

      if (key === 'style') {
        if (typeof newVal === 'object' && newVal !== null) {
          Object.entries(newVal).forEach(([k, v]) => { el.style[k] = v; });
          if (typeof oldVal === 'object' && oldVal !== null) {
            Object.keys(oldVal).forEach(k => {
              if (!(k in newVal)) el.style[k] = '';
            });
          }
        } else {
          el.removeAttribute('style');
        }
      } else if (key.startsWith('on')) {
        const eventName = key.toLowerCase().substring(2);
        const listeners = el._telaListeners || {};
        if (typeof listeners[key] === 'function') {
          el.removeEventListener(eventName, listeners[key]);
        }
        if (typeof newVal === 'function') {
          el.addEventListener(eventName, newVal);
          if (!el._telaListeners) el._telaListeners = {};
          el._telaListeners[key] = newVal;
        }
      } else if (newVal == null) {
        el.removeAttribute(key);
      } else {
        el.setAttribute(key, String(newVal));
      }
    }
  }

  // Diff and patch children of a DOM element
  _patchChildren(el, oldChildren, newChildren, instance) {
    const oldFlat = this.normalizeChildren(oldChildren);
    const newFlat = this.normalizeChildren(newChildren);

    // Snapshot current DOM children (live NodeList changes during mutations)
    const domChildren = Array.from(el.childNodes);

    const maxLen = Math.max(oldFlat.length, newFlat.length);

    for (let i = 0; i < maxLen; i++) {
      const oldChild = oldFlat[i] !== undefined ? oldFlat[i] : null;
      const newChild = newFlat[i] !== undefined ? newFlat[i] : null;
      const domChild = domChildren[i] || null;

      if (newChild == null && domChild) {
        el.removeChild(domChild);
      } else if (oldChild == null) {
        const newDom = this.createDOM(newChild, instance);
        el.appendChild(newDom);
      } else {
        this._patchNode(el, domChild, oldChild, newChild, instance);
      }
    }
  }

  // Recursively flatten nested arrays of vnodes
  normalizeChildren(children) {
    const flat = [];
    const stack = Array.isArray(children) ? [...children] : [children];
    while (stack.length) {
      const item = stack.shift();
      if (Array.isArray(item)) {
        for (let i = item.length - 1; i >= 0; i--) stack.unshift(item[i]);
      } else if (item != null && item !== false) {
        flat.push(item);
      }
    }
    return flat;
  }
}

if (typeof window !== 'undefined') {
  window.Tela = new TelaRuntime();
}

  if (typeof window === 'undefined') {
    return new TelaRuntime();
  }
  // Browser: expose singleton
  return new TelaRuntime();
}));
