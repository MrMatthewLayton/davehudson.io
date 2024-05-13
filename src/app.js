import './obsi.js';

let rootElement = null; // This will hold the root element of our app
let currentApp = null; // This will hold the current virtual DOM

/**
 * Creates a virtual DOM element.
 * @param {string} type The element type.
 * @param {Object} props The properties and attributes of the element.
 * @param {Array} childNodes The child elements or strings.
 * @returns {Object} A virtual DOM element.
 */
export function h(type, props, ...childNodes) {
    return {
        type,
        props: props || {},
        childNodes
    };
}

function changed(vnode1, vnode2) {
    return typeof vnode1 !== typeof vnode2 ||
           (typeof vnode1 === 'string' && vnode1 !== vnode2) ||
           vnode1.type !== vnode2.type;
}

function updateProps(element, oldProps, newProps) {
    for (const prop in oldProps) {
        if (!(prop in newProps)) {
            if (prop.startsWith('on')) { // Remove event listeners
                element.removeEventListener(prop.substring(2).toLowerCase(), oldProps[prop]);
            } else { // Remove attributes
                element[prop] = '';
            }
        }
    }

    for (const prop in newProps) {
        if (!(prop in oldProps)) {
            if (prop.startsWith('on')) { // Add event listeners
                element.addEventListener(prop.substring(2).toLowerCase(), newProps[prop]);
            } else { // Update attributes
                element[prop] = newProps[prop];
            }
        }
    }
}

function updateElement(parent, oldVNode, newVNode, index = 0) {
    if (!oldVNode && newVNode) {
        parent.appendChild(render(newVNode)); // Node added
        return;
    }

    if (oldVNode && !newVNode) {
        parent.removeChild(parent.childNodes[index]); // Node removed
        return;
    }

    if (oldVNode && newVNode && changed(oldVNode, newVNode)) {
        parent.replaceChild(render(newVNode), parent.childNodes[index]); // Node changed
        return;
    }

    if (oldVNode && newVNode && typeof oldVNode !== 'string' && oldVNode.type === newVNode.type) {
        updateProps(parent.childNodes[index], oldVNode.props, newVNode.props); // Update props
        const maxLength = Math.max(oldVNode.childNodes.length, newVNode.childNodes.length);
        for (let i = 0; i < maxLength; i++) {
            updateElement(parent.childNodes[index], oldVNode.childNodes[i], newVNode.childNodes[i], i);
        }
    }
}

// Enhanced render function to attach events
function render(vnode) {
    if (typeof vnode === 'string') {
        const element = document.createTextNode(vnode);
        return element;
    }

    const { type, props, childNodes } = vnode;
    const element = document.createElement(type);

    for (const key in props) {
        if (key.startsWith('on')) {
            element.addEventListener(key.substring(2).toLowerCase(), props[key]);
        } else {
            element[key] = props[key];
        }
    }

    childNodes.map(render).forEach(child => element.appendChild(child));

    return element;
}

function createState(initialState) {
    let state = initialState;
    const subscribers = [];

    const getState = () => state;

    const setState = (newState) => {
        if (state !== newState) {
            state = newState;
            subscribers.forEach((subscriber) => subscriber()); // Notify all subscribers
        }
    };

    const subscribe = (callback) => {
        subscribers.push(callback);
    };

    return [getState, setState, subscribe];
}

function Counter(identifier) {
    const [count, setCount, subscribe] = createState(0);
    let counterId = identifier;
    let vDom = null;

    const incCount = () => setCount(count() + 1);
    const decCount = () => setCount(count() - 1);

    const component = () => h('div', {id: identifier},
        h('h2', {}, `Count: ${count()}`),
        h('button', { onClick: () => incCount() }, 'Increment'),
        h('button', { onClick: () => decCount() }, 'Decrement')
    );

    subscribe(() => {
        const elem = document.getElementById(counterId);
        const parentElem = elem.parentNode;
        const index = Array.from(parentElem.childNodes).indexOf(elem);
        const newVDom = component();
        updateElement(parentElem, vDom, newVDom, index);
        vDom = newVDom;
    });

    vDom = component()
    return vDom;
}

function homePage() {
    return h('div', { className: 'app' },
        h('header', { className: 'header' }, 'Welcome to My App with Two Counters'),
        h('main', { className: 'main-content' },
            h('section', { className: 'description' },
                'Explore the counters below to interact with the virtual DOM:',
                Counter('counter-1'),
                Counter('counter-2')
            ),
            h('article', {}, 'More content can follow here.')
        ),
        h('a', { href: '/about', onClick: () => navigate('/about') }, 'About'),
        h('footer', { className: 'footer' }, 'Footer content goes here. © 2024.')
    );
}

function aboutPage() {
    return h('div', null,
        h('h1', null, 'About Page'),
        h('a', { href: '/', onClick: () => navigate('/') }, 'Home')
    );
}

function notFoundPage() {
    return h('div', null,
        h('h1', null, '404: Page Not Found'),
        h('a', { href: '/', onClick: () => navigate('/') }, 'Home')
    );
}

function clearPageContent(container) {
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
}

const routes = {
    '/': homePage,
    '/about': aboutPage
};

function handleLocation() {
    const app = document.querySelector('#app');
    clearPageContent(app);
    const path = window.location.pathname;
    const pageFunction = routes[path] || notFoundPage;

    const newApp = pageFunction(); // Generate new VDOM
    rootElement = render(newApp);
    app.appendChild(rootElement);
    currentApp = newApp; // Update current VDOM
}

function navigate(path) {
    window.history.pushState({}, '', path);
    handleLocation();
}

function route_init() {
    window.onpopstate = () => handleLocation();
    handleLocation();
}

document.addEventListener('DOMContentLoaded', route_init());
