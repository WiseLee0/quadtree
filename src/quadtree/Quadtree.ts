import type { NodeGeometry, Indexable } from './types';
import type { Rectangle } from './Rectangle';

/**
 * Quadtree Constructor Properties
 */
export interface QuadtreeProps {

    /**
     * Width of the node.
     */
    width: number

    /**
     * Height of the node.
     */
    height: number

    /**
     * X Offset of the node.
     * @defaultValue `0`
     */
    x?: number

    /**
     * Y Offset of the node.
     * @defaultValue `0`
     */
    y?: number

    /**
     * Max objects this node can hold before it splits.
     * @defaultValue `10`
     */
    maxObjects?: number

    /**
     * Total max nesting levels of the root Quadtree node.
     * @defaultValue `4`
     */
    maxLevels?: number
}

/**
 * Class representing a Quadtree node.
 * 
 * @example
 * ```typescript
 * const tree = new Quadtree({
 *   width: 100,
 *   height: 100,
 *   x: 0,           // optional, default:  0
 *   y: 0,           // optional, default:  0
 *   maxObjects: 10, // optional, default: 10
 *   maxLevels: 4,   // optional, default:  4
 * });
 * ```
 * 
 * @example Typescript: If you like to be explicit, you optionally can pass in a generic type for objects to be stored in the Quadtree:
 * ```typescript
 * class GameEntity extends Rectangle {
 *   ...
 * }
 * const tree = new Quadtree<GameEntity>({
 *   width: 100,
 *   height: 100,
 * });
 * ```
 */
export class Quadtree<ObjectsType extends Rectangle | Indexable> {

    /**
     * The numeric boundaries of this node.
     * @readonly
     */
    bounds: NodeGeometry;

    /**
     * Max objects this node can hold before it splits.
     * @defaultValue `10`
     * @readonly
     */
    maxObjects: number;

    /**
     * Total max nesting levels of the root Quadtree node.
     * @defaultValue `4`
     * @readonly
     */
    maxLevels: number;

    /**
     * The level of this node.
     * @defaultValue `0`
     * @readonly
     */
    level: number;

    /**
     * Array of objects in this node.
     * @defaultValue `[]`
     * @readonly
     */
    objects: ObjectsType[];

    /**
     * Subnodes of this node
     * @defaultValue `[]`
     * @readonly
     */
    nodes: Quadtree<ObjectsType>[];

    /**
     * Quadtree Constructor
     * @param props - bounds and properties of the node
     * @param level - depth level (internal use only, required for subnodes)
     */
    constructor(props: QuadtreeProps, level = 0) {

        this.bounds = {
            x: props.x || 0,
            y: props.y || 0,
            width: props.width,
            height: props.height,
        };
        this.maxObjects = (typeof props.maxObjects === 'number') ? props.maxObjects : 10;
        this.maxLevels = (typeof props.maxLevels === 'number') ? props.maxLevels : 4;
        this.level = level;

        this.objects = [];
        this.nodes = [];
    }

    /**
     * Get the quadrant (subnode indexes) an object belongs to.
     * @param obj - object to be checked
     * @returns Array containing indexes of intersecting subnodes (0-3 = top-right, top-left, bottom-left, bottom-right).
     */
    getIndex(obj: Rectangle | Indexable): number[] {
        return obj.qtIndex(this.bounds);
    }

    /**
     * Split the node into 4 subnodes.
     * @internal
     * 
     * @example Mostly for internal use! You should only call this yourself if you know what you are doing:
     * ```typescript
     * const tree = new Quadtree({ width: 100, height: 100 });
     * tree.split();
     * console.log(tree); // now tree has four subnodes
     * ```
     */
    split(): void {

        const level = this.level + 1,
            width = this.bounds.width / 2,
            height = this.bounds.height / 2,
            x = this.bounds.x,
            y = this.bounds.y;

        const coords = [
            { x: x + width, y: y },
            { x: x, y: y },
            { x: x, y: y + height },
            { x: x + width, y: y + height },
        ];

        for (let i = 0; i < 4; i++) {
            this.nodes[i] = new Quadtree({
                x: coords[i].x,
                y: coords[i].y,
                width,
                height,
                maxObjects: this.maxObjects,
                maxLevels: this.maxLevels,
            }, level);
        }
    }


    /**
     * Insert an object into the node. If the node
     * exceeds the capacity, it will split and add all
     * objects to their corresponding subnodes.
     * 
     * @param obj - Object to be added.
     */
    insert(obj: ObjectsType): void {
        //if we have subnodes, call insert on matching subnodes
        if (this.nodes.length) {
            const indexes = this.getIndex(obj);

            for (let i = 0; i < indexes.length; i++) {
                this.nodes[indexes[i]].insert(obj);
            }
            return;
        }

        //otherwise, store object here
        obj.addBound(this.bounds)
        this.objects.push(obj);

        //maxObjects reached
        if (this.objects.length > this.maxObjects && this.level < this.maxLevels) {

            //split if we don't already have subnodes
            if (!this.nodes.length) {
                this.split();
            }

            //add all objects to their corresponding subnode
            for (let i = 0; i < this.objects.length; i++) {
                const obj = this.objects[i]
                const indexes = this.getIndex(obj);
                for (let k = 0; k < indexes.length; k++) {
                    this.nodes[indexes[k]].insert(obj);
                }
                obj.deleteBound(this.bounds)
            }

            //clean up this node
            this.objects = [];
        }
    }

    /**
     * Return all objects that could collide with the given geometry.
     * @param obj - geometry to be checked
     * @returns Array containing all detected objects.
     */
    retrieve(obj: Rectangle | Indexable): ObjectsType[] {

        const indexes = this.getIndex(obj);
        let returnObjects = this.objects;

        //if we have subnodes, retrieve their objects
        if (this.nodes.length) {
            for (let i = 0; i < indexes.length; i++) {
                returnObjects = returnObjects.concat(this.nodes[indexes[i]].retrieve(obj));
            }
        }

        //remove duplicates
        returnObjects = returnObjects.filter(function (item, index) {
            return returnObjects.indexOf(item) >= index;
        });

        return returnObjects;
    }


    /**
     * Clear the Quadtree.
     */
    clear(): void {
        this.objects = [];
        for (let i = 0; i < this.nodes.length; i++) {
            if (this.nodes.length) {
                this.nodes[i].clear();
            }
        }
        this.nodes = [];
    }


    getTileBounds(obj: Rectangle | Indexable) {
        const indexes = this.getIndex(obj);
        let returnBounds: any[] = [];

        if (this.nodes.length) {
            for (let i = 0; i < indexes.length; i++) {
                const bounds = this.nodes[indexes[i]].getTileBounds(obj)
                returnBounds = [...returnBounds, ...bounds]
            }
        } else {
            returnBounds.push(this.bounds)
        }
        return returnBounds;
    }

    remove<T extends ObjectsType>(obj: T) {
        const indexes = this.getIndex(obj);
        let returnObjects = this.objects

        //if we have subnodes, retrieve their objects
        if (this.nodes.length) {
            for (let i = 0; i < indexes.length; i++) {
                this.nodes[indexes[i]].remove(obj);
            }
        }
        this.objects = []
        return returnObjects as unknown as T[];
    }

    getAll() {
        let objects = this.objects;

        for (let i = 0; i < this.nodes.length; i = i + 1) {
            objects = objects.concat(this.nodes[i].getAll());
        }

        return objects;
    }

    clearup(): void {
        const objects = this.getAll();

        this.clear();

        for (let i = 0; i < objects.length; i++) {
            this.insert(objects[i]);
        }
    }
}
