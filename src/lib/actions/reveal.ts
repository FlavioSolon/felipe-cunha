/**
 * Action to reveal elements when they scroll into view using Intersection Observer.
 * Adds the 'visible' class to the node when intersecting.
 */
export function reveal(node: HTMLElement) {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    node.classList.add('visible');
                    observer.unobserve(node); // Reveal once
                }
            });
        },
        { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    observer.observe(node);

    return {
        destroy() {
            observer.disconnect();
        }
    };
}
