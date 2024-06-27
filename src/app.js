import { h, updateElement } from './lib/dvdi.js';
import { aboutPage } from './about/about.js';
import { blogPage, blogSummaries, getBlogRoutes } from './blog/blog.js';
import { projectsPage } from './projects/projects.js';
import { pageHeader, articleTitle, pageFooter } from "./lib/page.js";

console.log('SCRIPT RELOADED!')

const updateQueue = new Set();

/*
 * Enqueues updates and executes them in a batch using requestAnimationFrame.
 */
function enqueueVDomUpdate(update) {
    updateQueue.add(update);
    if (updateQueue.size === 1) {
        requestAnimationFrame(runVDomUpdates);
    }
}

/*
 * Runs all updates that have been enqueued.
 */
function runVDomUpdates() {
    updateQueue.forEach(update => update());
    updateQueue.clear();
}

function homePage() {
    return h('div', { className: 'container' },
        pageHeader(),
        h('article', { className: 'article' },
            articleTitle('Dreaming in data and code'),
            h('figure', {},
                h('img', {
                    src: '/dream-data-code.webp',
                    width: '800',
                    height: '286',
                    alt: 'Conceptual image of dreaming in data and code'
                }),
            ),
            h('p', {},
                'Software is the most amazing playground for an engineer.  A few inconvenient laws of physics aside, ' +
                'if we can imagine something, then we can probably build it.'
            ),
            h('p', {},
                'Software engineering is a surprisingly artistic endeavour.  There can be many elegant solutions to any ' +
                'given problem, and all come with trade-offs.  But, in exploring all those choices and their consequences, ' +
                'we may gain some new insights to help guide us in the future.'
            ),
            h('p', {},
                'This site was created to let me explore, and try to explain things that people dream in data and code.'
            ),
                ...blogSummaries(7),
        ),
        h('hr', {}),
        h('h2', {}, 'More blog posts'),
        h('p', {},
            'You can find older blog posts on this page: ',
            h('a', { href: '/blog', onClick: (e) => navigateEvent(e, '/blog') }, 'Blog')
        ),
        pageFooter()
    );
}

function notFoundPage(path) {
    return h('div', { className: 'container' },
        pageHeader(),
        h('article', { className: 'article' },
            articleTitle(`404: Page "${path}" not found`),
            h('p', {}, 'This is unlikely to be the page you were looking for!'),
            h('p', {},
                'If you\'ve arrived here via an old link from the hashingit.com blog, please take a look at ',
                h('a', { href: '/blog', onClick: (e) => navigateEvent(e, '/blog') }, 'Blog'),
                '.  You should find all the original articles there.'
            )
        ),
        pageFooter()
    );
}

let routes = {
    '': homePage,
    '/about': aboutPage,
    '/projects': projectsPage,
    '/blog': blogPage
};

let rootVNode = null;

function handleLocation() {
    let path = window.location.pathname;

    // If there's a trailing slash on the path, remove it.
    if (path.endsWith('/')) {
        path = path.slice(0, -1);
    }

    let pageFunction = routes[path];
    if (pageFunction === undefined) {
        pageFunction = () => notFoundPage(path);
    }

    const newVNode = pageFunction();
    const app = document.querySelector('#app');

    updateElement(app, null, rootVNode, newVNode, 0);
    rootVNode = newVNode;
    console.log(`navigated to ${path}`)
}

export function navigateEvent(e, path) {
    e.preventDefault();
    const scrollPosition = {
        y: window.scrollY,
        x: window.scrollX
    }

    window.history.pushState({ scrollPosition }, '', path);
    handleLocation();
    window.scrollTo(0, 0);
}

function routeInit() {
    // Add all the blog content to the router.
    const blogRoutes = getBlogRoutes();
    Object.assign(routes, blogRoutes);

    // Set up the navigation for stepping backwards.
    window.onpopstate = (e) => {
        handleLocation();
        if (!e.state) {
            window.scrollTo(0, 0);
        } else {
            const scrollPosition = e.state.scrollPosition;
            window.scrollTo(scrollPosition.x, scrollPosition.y);
        }
    };

    handleLocation();
}

document.addEventListener('DOMContentLoaded', routeInit());
