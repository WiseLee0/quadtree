import { Quadtree, Rectangle } from "../quadtree";

describe('Quadtree.insert', () => {

    test('is a function', () => {
        const tree = new Quadtree({ width: 100, height: 100 });
        expect(typeof tree.insert).toBe('function');
    });

    test('returns undefined', () => {
        const tree = new Quadtree({ width: 100, height: 100 });
        const rect = new Rectangle({ x: 0, y: 0, width: 100, height: 100 });
        expect(tree.insert(rect)).toBeUndefined();
    });

    test('rect dynamic modify bounds', () => {
        const tree = new Quadtree({ width: 100, height: 100, maxObjects: 1, maxLevels: 1 });
        const rect1 = new Rectangle({ x: 0, y: 0, width: 10, height: 10 });
        const rect2 = new Rectangle({ x: 50, y: 50, width: 10, height: 10 });
        const rect3 = new Rectangle({ x: 40, y: 40, width: 30, height: 30 });
        tree.insert(rect1)
        tree.insert(rect2)
        tree.insert(rect3)
        expect(rect1.bounds).toEqual([{ x: 0, y: 0, width: 50, height: 50 }])
        expect(rect2.bounds).toEqual([{ x: 50, y: 50, width: 50, height: 50 }])
        expect(rect3.bounds.length).toEqual(4)
    });

    test('adds objects to objects array', () => {
        const tree = new Quadtree({ width: 100, height: 100 });
        const rect = new Rectangle({ x: 0, y: 0, width: 100, height: 100 });
        tree.insert(rect);
        expect(tree.objects).toEqual([rect]);
    });

    test('adds objects to subnodes', () => {
        const tree = new Quadtree({ width: 100, height: 100 });
        const rect = new Rectangle({ x: 0, y: 0, width: 100, height: 100 });
        tree.split();
        tree.insert(rect);
        expect(tree.nodes[0].objects).toEqual([rect]);
        expect(tree.nodes[1].objects).toEqual([rect]);
        expect(tree.nodes[2].objects).toEqual([rect]);
        expect(tree.nodes[3].objects).toEqual([rect]);
    });

    test('calls insert recursively', () => {
        const tree = new Quadtree({ width: 100, height: 100 });
        const rect = new Rectangle({ x: 0, y: 0, width: 100, height: 100 });
        tree.split();

        jest.spyOn(tree.nodes[0], 'insert');
        jest.spyOn(tree.nodes[1], 'insert');
        jest.spyOn(tree.nodes[2], 'insert');
        jest.spyOn(tree.nodes[3], 'insert');

        tree.insert(rect);
        expect(tree.nodes[0].insert).toHaveBeenCalledTimes(1);
        expect(tree.nodes[1].insert).toHaveBeenCalledTimes(1);
        expect(tree.nodes[2].insert).toHaveBeenCalledTimes(1);
        expect(tree.nodes[3].insert).toHaveBeenCalledTimes(1);
    });

    test('calls split when maxObjects has been reached', () => {
        const tree = new Quadtree({ width: 100, height: 100 });
        jest.spyOn(tree, 'split');
        for (let i = 0; i <= tree.maxObjects; i++) {
            const rect = new Rectangle({ x: 0, y: 0, width: 100, height: 100 });
            tree.insert(rect);
        }
        expect(tree.split).toHaveBeenCalledTimes(1);
    });

    test('does not call split when maxLevels has been reached', () => {
        const tree = new Quadtree({ width: 100, height: 100, maxObjects: 10, maxLevels: 0 });
        jest.spyOn(tree, 'split');
        for (let i = 0; i <= tree.maxObjects; i++) {
            const rect = new Rectangle({ x: 0, y: 0, width: 100, height: 100 });
            tree.insert(rect);
        }
        expect(tree.split).toHaveBeenCalledTimes(0);
    });
});