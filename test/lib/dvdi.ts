import { jest } from '@jest/globals';

import { VNode, updateElement, h, svg } from '../../src/lib/dvdi';

describe('VNode Class', () => {
    test('constructor initializes properties correctly', () => {
        const vNode = new VNode('html', 'div', { id: 'test' }, []);
        expect(vNode.type).toBe('div');
        expect(vNode.props).toEqual({ id: 'test' });
        expect(vNode.childNodes).toEqual([]);
    });

    test('appendChild adds a child VNode', () => {
        const vNode = new VNode('html', 'div', {}, []);
        const child = new VNode('html', 'span', {}, []);
        vNode.appendChild(child);
        expect(vNode.childNodes).toContain(child);
        expect(child.parentVNode).toBe(vNode);
    });

    test('appendChild adds a string child VNode', () => {
        const vNode = new VNode('html', 'div', {}, []);
        const child = 'fred';
        vNode.appendChild(child);
        expect(vNode.childNodes).toContain(child);
    });

    test('removeChild removes a child VNode', () => {
        const vNode = new VNode('html', 'div', {}, []);
        const child = new VNode('html', 'span', {}, []);
        vNode.appendChild(child);
        vNode.removeChild(child);
        expect(vNode.childNodes).not.toContain(child);
        expect(child.parentVNode).toBeNull();
    });

    test('removeChild removes a string child VNode', () => {
        const vNode = new VNode('html', 'div', {}, []);
        const child = 'fred';
        vNode.appendChild(child);
        vNode.removeChild(child);
        expect(vNode.childNodes).not.toContain(child);
    });

    test('replaceChild replaces an old child VNode with a new one', () => {
        const vNode = new VNode('html', 'div', {}, []);
        const oldChild = new VNode('html', 'span', {}, []);
        const newChild = new VNode('html', 'p', {}, []);
        vNode.appendChild(oldChild);
        vNode.replaceChild(newChild, oldChild);
        expect(vNode.childNodes).not.toContain(oldChild);
        expect(vNode.childNodes).toContain(newChild);
        expect(newChild.parentVNode).toBe(vNode);
        expect(oldChild.parentVNode).toBeNull();
    });

    test('replaceChild replaces an old string child VNode with a new one', () => {
        const vNode = new VNode('html', 'div', {}, []);
        const oldChild = 'fred';
        const newChild = new VNode('html', 'p', {}, []);
        vNode.appendChild(oldChild);
        vNode.replaceChild(newChild, oldChild);
        expect(vNode.childNodes).not.toContain(oldChild);
        expect(vNode.childNodes).toContain(newChild);
        expect(newChild.parentVNode).toBe(vNode);
    });

    test('replaceChild replaces an old child VNode with a new string one', () => {
        const vNode = new VNode('html', 'div', {}, []);
        const oldChild = new VNode('html', 'span', {}, []);
        const newChild = 'fred';
        vNode.appendChild(oldChild);
        vNode.replaceChild(newChild, oldChild);
        expect(vNode.childNodes).not.toContain(oldChild);
        expect(vNode.childNodes).toContain(newChild);
        expect(oldChild.parentVNode).toBe(null);
    });
});

describe('updateElement function', () => {
    test('updateElement adds a new node', () => {
        const parent = document.createElement('div');
        const newVNode = new VNode('html', 'span', {}, []);
        updateElement(parent, null, null, null, newVNode);
        expect(parent.childNodes).toContain(newVNode.domElement);
    });

    test('updateElement adds a new node to a parent node', () => {
        const parent = document.createElement('div');
        const parentVNode = new VNode('html', 'div');
        const newVNode = new VNode('html', 'span', {}, []);
        updateElement(parent, null, parentVNode, null, newVNode);
        expect(parent.childNodes).toContain(newVNode.domElement);
    });

    test('updateElement removes an old node', () => {
        const parent = document.createElement('div');
        const oldVNode = new VNode('html', 'span', {}, []);
        updateElement(parent, null, null, null, oldVNode);
        updateElement(parent, parent.childNodes[0], null, oldVNode, null);
        expect(parent.childNodes).not.toContain(oldVNode.domElement);
    });

    test('updateElement removes and old node from a parent node', () => {
        const parent = document.createElement('div');
        const parentVNode = new VNode('html', 'div');
        const newVNode = new VNode('html', 'span', {}, []);
        updateElement(parent, null, parentVNode, null, newVNode);
        updateElement(parent, parent.childNodes[0], parentVNode, newVNode, null);
        expect(parent.childNodes).not.toContain(newVNode.domElement);
    });

    test('updateElement replaces a node', () => {
        const parent = document.createElement('div');
        const oldVNode = new VNode('html', 'span', {}, []);
        const newVNode = new VNode('html', 'p', {}, []);
        updateElement(parent, null, null, null, oldVNode);
        updateElement(parent, parent.childNodes[0], null, oldVNode, newVNode);
        expect(parent.childNodes.length).toBe(1);
        expect(parent.childNodes).toContain(newVNode.domElement);
    });

    test('updateElement replaces a node of a parent node', () => {
        const parent = document.createElement('div');
        const parentVNode = new VNode('html', 'div');
        const oldVNode = new VNode('html', 'span', {}, []);
        const newVNode = new VNode('html', 'p', {}, []);
        updateElement(parent, null, parentVNode, null, oldVNode);
        updateElement(parent, parent.childNodes[0], parentVNode, oldVNode, newVNode);
        expect(parent.childNodes.length).toBe(1);
        expect(parent.childNodes).toContain(newVNode.domElement);
    });

    test('updateElement replaces a node with a string node', () => {
        const parent = document.createElement('div');
        const oldVNode = new VNode('html', 'span', {}, []);
        const newVNode = 'george';
        updateElement(parent, null, null, null, oldVNode);
        updateElement(parent, parent.childNodes[0], null, oldVNode, newVNode);
        expect(parent.childNodes.length).toBe(1);
        expect(parent.childNodes[0].textContent).toBe('george');
    });

    test('updateElement replaces a string node with a node', () => {
        const parent = document.createElement('div');
        const oldVNode = 'fred';
        const newVNode = new VNode('html', 'span', {}, []);
        updateElement(parent, null, null, null, oldVNode);
        updateElement(parent, parent.childNodes[0], null, oldVNode, newVNode);
        expect(parent.childNodes.length).toBe(1);
        expect(parent.childNodes).toContain(newVNode.domElement);
    });

    test('updateElement replaces a string node with another string node', () => {
        const parent = document.createElement('div');
        const oldVNode = 'fred';
        const newVNode = 'george';
        updateElement(parent, null, null, null, oldVNode);
        updateElement(parent, parent.childNodes[0], null, oldVNode, newVNode);
        expect(parent.childNodes.length).toBe(1);
        expect(parent.childNodes[0].textContent).toBe('george');
    });

    test('updateElement replaces a string node with an identical string node', () => {
        const parent = document.createElement('div');
        const oldVNode = 'fred';
        const newVNode = 'fred';
        updateElement(parent, null, null, null, oldVNode);
        updateElement(parent, parent.childNodes[0], null, oldVNode, newVNode);
        expect(parent.childNodes.length).toBe(1);
        expect(parent.childNodes[0].textContent).toBe('fred');
    });

    test('updateElement replaces a composite node', () => {
        const parent = document.createElement('div');
        const oldVNode = h('span', {}, h('p', {}, 'old text'));
        const newVNode = h('span', {}, h('p', {}, 'new text'));
        updateElement(parent, null, null, null, oldVNode);
        updateElement(parent, parent.childNodes[0], null, oldVNode, newVNode);
        expect(parent.childNodes.length).toBe(1);
        expect(parent.childNodes).toContain(newVNode.domElement);
    });

    test('updateElement replaces a composite node with a bigger composite node', () => {
        const parent = document.createElement('div');
        const oldVNode = h('span', {}, h('p', {}, 'old text'));
        const newVNode = h('span', {}, h('p', {}, 'new text'), h('h2', {}, 'heading 2'), h('h3', {}, 'heading 3'));
        updateElement(parent, null, null, null, oldVNode);
        updateElement(parent, parent.childNodes[0], null, oldVNode, newVNode);
        expect(parent.childNodes.length).toBe(1);
        expect(parent.childNodes).toContain(newVNode.domElement);
    });

    test('updateElement replaces a composite node with a smaller composite node', () => {
        const parent = document.createElement('div');
        const oldVNode = h('span', {}, h('p', {}, 'old text'), h('h2', {}, 'heading 2'), h('h3', {}, 'heading 3'));
        const newVNode = h('span', {}, h('p', {}, 'new text'));
        updateElement(parent, null, null, null, oldVNode);
        updateElement(parent, parent.childNodes[0], null, oldVNode, newVNode);
        expect(parent.childNodes.length).toBe(1);
        expect(parent.childNodes).toContain(newVNode.domElement);
    });

    test('updateElement adds a node with properties', () => {
        const parent = document.createElement('div');
        const newVNode = new VNode('html', 'span', { className: 'test', onClick: () => {} }, []);
        updateElement(parent, null, null, null, newVNode);
        expect(parent.childNodes).toContain(newVNode.domElement);
    });

    test('updateElement removes a node with properties', () => {
        const parent = document.createElement('div');
        const newVNode = new VNode('html', 'span', { className: 'test', onClick: () => {} }, []);
        updateElement(parent, null, null, null, newVNode);
        updateElement(parent, parent.childNodes[0], null, newVNode, null);
        expect(parent.childNodes.length).toBe(0);
    });

    test('updateElement replaces a node with properties', () => {
        const parent = document.createElement('div');
        const oldVNode = new VNode('html', 'span', { className: 'test', id: 'bob', onClick: () => {} }, []);
        const newVNode = new VNode('html', 'span', { className: 'test', id: 'fred', onClick: () => {} }, []);
        updateElement(parent, null, null, null, oldVNode);
        updateElement(parent, parent.childNodes[0], null, oldVNode, newVNode);
        expect(Object.keys(newVNode.props).length).toBe(3);
        expect(newVNode.props['id']).toBe('fred');
    });

    test('updateElement replaces a node with different properties', () => {
        const parent = document.createElement('div');
        const oldVNode = new VNode('html', 'span', { className: 'test', style: 'bob', onClick: () => {} }, []);
        const newVNode = new VNode('html', 'span', { className: 'test', id: 'fred', onClick: () => {} }, []);
        updateElement(parent, null, null, null, oldVNode);
        updateElement(parent, parent.childNodes[0], null, oldVNode, newVNode);
        expect(Object.keys(newVNode.props).length).toBe(3);
        expect(newVNode.props['id']).toBe('fred');
    });

    test('updateElement replaces an HTML node with an SVG node', () => {
        const parent = document.createElement('div');
        const oldVNode = new VNode('html', 'span', { className: 'test', style: 'bob', onClick: () => {} }, []);
        const newVNode = new VNode('svg', 'svg', {
                xmlns: 'http://www.w3.org/2000/svg',
                'xml:space': 'preserve',
                onClick: () => { console.log('click'); }
            },
            []
        );
        updateElement(parent, null, null, null, oldVNode);
        updateElement(parent, parent.childNodes[0], null, oldVNode, newVNode);
        expect(Object.keys(newVNode.props).length).toBe(3);
        expect(newVNode.props['xmlns']).toBe('http://www.w3.org/2000/svg');
    });

    test('updateElement replaces an SVG node with an HTML node', () => {
        const parent = document.createElement('div');
        const oldVNode = new VNode('svg', 'svg', {
                xmlns: 'http://www.w3.org/2000/svg',
                'xml:space': 'preserve',
                onClick: () => { console.log('click'); }
            },
            []
        );
        const newVNode = new VNode('html', 'span', { className: 'test', style: 'bob', onClick: () => {} }, []);
        updateElement(parent, null, null, null, oldVNode);
        updateElement(parent, parent.childNodes[0], null, oldVNode, newVNode);
        expect(Object.keys(newVNode.props).length).toBe(3);
        expect(newVNode.props['style']).toBe('bob');
    });

    test('updateElement mounts a component', () => {
        function TestComponent() {
            const component = () => h('div', {},
                h('h2', {}, `Count: 0`),
                h('button', {}, 'Increment'),
                h('button', {}, 'Decrement')
            );

            let vNode = component();
            vNode.mountCallback = jest.fn();

            return vNode;
        }

        const parent = document.createElement('div');
        const newVNode = TestComponent();
        updateElement(parent, null, null, null, newVNode);
        expect(newVNode.mountCallback).toHaveBeenCalled();
        expect(parent.childNodes).toContain(newVNode.domElement);
    });

    test('updateElement unmounts a component', () => {
        function TestComponent() {
            const component = () => h('div', {},
                h('h2', {}, `Count: 0`),
                h('button', {}, 'Increment'),
                h('button', {}, 'Decrement')
            );

            let vNode = component();
            vNode.unmountCallback = jest.fn();

            return vNode;
        }

        const parent = document.createElement('div');
        const newVNode = TestComponent();
        updateElement(parent, null, null, null, newVNode);
        updateElement(parent, parent.childNodes[0], null, newVNode, null);
        expect(newVNode.unmountCallback).toHaveBeenCalled();
        expect(parent.childNodes.length).toBe(0);
    });
});

describe('h function', () => {
    test('h creates a virtual DOM element', () => {
        const vNode = h('div', { id: 'test' }, 'child');
        expect(vNode.type).toBe('div');
        expect(vNode.props).toEqual({ id: 'test' });
        expect(vNode.childNodes).toContain('child');
    });

    test('h created with no params', () => {
        const vNode = h('div');
        expect(vNode.type).toBe('div');
        expect(vNode.props).toEqual({});
    });
});

describe('svg function', () => {
    test('svg creates a virtual DOM element', () => {
        const vNode = svg('svg', { xmlns: 'http://www.w3.org/2000/svg' }, 'child');
        expect(vNode.type).toBe('svg');
        expect(vNode.props).toEqual({ xmlns: 'http://www.w3.org/2000/svg' });
        expect(vNode.childNodes).toContain('child');
    });

    test('svg created with no params', () => {
        const vNode = svg('svg');
        expect(vNode.type).toBe('svg');
        expect(vNode.props).toEqual({});
    });
});
