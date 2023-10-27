import type { NodeGeometry, Indexable } from './types';

/**
 * Rectangle Geometry
 * @beta
 * 
 * @remarks
 * This interface simply represents a rectangle geometry.
 */
export interface RectangleGeometry {

    /**
     * X start of the rectangle (top left).
     */
    x: number

    /**
     * Y start of the rectangle (top left).
     */
    y: number

    /**
     * Width of the rectangle.
     */
    width: number

    /**
     * Height of the rectangle.
     */
    height: number
}

/**
 * Rectangle Constructor Properties
 * @beta
 * @typeParam CustomDataType - Type of the custom data property (optional, inferred automatically).
 */
export interface RectangleProps<CustomDataType = void> extends RectangleGeometry {

    /**
     * Custom data
     */
    data?: CustomDataType
}

export class Rectangle<CustomDataType = void> implements RectangleGeometry, Indexable {

    /**
     * X start of the rectangle (top left).
     */
    x: number;

    /**
     * Y start of the rectangle (top left).
     */
    y: number;

    /**
     * Width of the rectangle.
     */
    width: number;

    /**
     * Height of the rectangle.
     */
    height: number;

    /**
     * Custom data.
     */
    data?: CustomDataType;

    /**
     * Bounds of the rectangle.
     */
    private __bounds = new Set<string>()

    constructor(props: RectangleProps<CustomDataType>) {

        this.x = props.x;
        this.y = props.y;
        this.width = props.width;
        this.height = props.height;
        this.data = props.data;
    }

    /**
     * Determine which quadrant this rectangle belongs to.
     * @param node - Quadtree node to be checked
     * @returns Array containing indexes of intersecting subnodes (0-3 = top-right, top-left, bottom-left, bottom-right)
     */
    qtIndex(node: NodeGeometry): number[] {

        const indexes: number[] = [],
            boundsCenterX = node.x + (node.width / 2),
            boundsCenterY = node.y + (node.height / 2);

        const startIsNorth = this.y < boundsCenterY,
            startIsWest = this.x < boundsCenterX,
            endIsEast = this.x + this.width > boundsCenterX,
            endIsSouth = this.y + this.height > boundsCenterY;

        //top-right quad
        if (startIsNorth && endIsEast) {
            indexes.push(0);
        }

        //top-left quad
        if (startIsWest && startIsNorth) {
            indexes.push(1);
        }

        //bottom-left quad
        if (startIsWest && endIsSouth) {
            indexes.push(2);
        }

        //bottom-right quad
        if (endIsEast && endIsSouth) {
            indexes.push(3);
        }

        return indexes;
    }


    addBound(bound: RectangleGeometry) {
        this.__bounds.add(`${bound.x}-${bound.y}-${bound.width}-${bound.height}`)
    }

    deleteBound(bound: RectangleGeometry) {
        this.__bounds.delete(`${bound.x}-${bound.y}-${bound.width}-${bound.height}`)
    }

    /**
     * Get the position of the rectangle in the quadtree
     */
    get bounds() {
        const arr = []
        for (const key of this.__bounds) {
            const [x, y, width, height] = key.split('-').map(i => +i)
            arr.push({
                x, y, width, height
            })
        }
        return arr;
    }

    get boundsSet() {
        return this.__bounds
    }
}