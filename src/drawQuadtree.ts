import { Indexable, Quadtree, Rectangle } from "./quadtree";
import { Canvas, CanvasKit, Paint, Surface, Image, InputRect } from 'canvaskit-wasm';
const CANVAS_WIDTH = 600
export default class DrawQuadTree {
    private CanvasKit: CanvasKit
    private Surface: Surface
    private paint: Paint
    private canvas: Canvas
    private originCanvas: HTMLCanvasElement | OffscreenCanvas
    constructor(CanvasKit: CanvasKit, canvas: HTMLCanvasElement | OffscreenCanvas) {
        this.originCanvas = canvas
        this.CanvasKit = CanvasKit
        this.Surface = CanvasKit.MakeWebGLCanvasSurface((canvas as any))!;
        this.paint = new CanvasKit.Paint();
        this.canvas = this.Surface.getCanvas()!
    }

    private _drawQuadtree(node: Quadtree<Rectangle<void> | Indexable>) {
        const bounds = node.bounds;
        if (node.nodes.length === 0) {
            this.canvas.drawRect([bounds.x, bounds.y, bounds.x + bounds.width, bounds.y + bounds.height], this.paint)
        } else {
            for (let i = 0; i < node.nodes.length; i = i + 1) {
                this._drawQuadtree(node.nodes[i]);
            }
        }
    };

    private _drawObjects(myObjects: any[]) {
        for (var i = 0; i < myObjects.length; i++) {
            const obj = myObjects[i]
            this.canvas.drawRect(this.CanvasKit.LTRBRect(obj.x, obj.y, obj.x + obj.width, obj.y + obj.height), this.paint)
        }
    }


    drawQuadtree(node: Quadtree<Rectangle<void> | Indexable>) {
        this.paint.setColor([1, 0.3, 0.3, 0.5])
        this.paint.setStyle(this.CanvasKit.PaintStyle.Stroke)
        this._drawQuadtree(node)
    }

    drawObjects(myObjects: any[], color = [1, 1, 1, 0.5]) {
        this.paint.setColor(color)
        this.paint.setStyle(this.CanvasKit.PaintStyle.Stroke)
        this._drawObjects(myObjects)
    }

    drawDirtyArea(bounds: any[]) {
        this.paint.setColor([0.2, 1, 0.2, 0.5])
        this.paint.setStyle(this.CanvasKit.PaintStyle.Fill)
        this._drawObjects(bounds)
    }

    getCanvas() {
        return this.originCanvas
    }

    drawImage(canvas: OffscreenCanvas | HTMLCanvasElement, src?: InputRect, dest?: InputRect) {
        const imgs = this.CanvasKit.MakeImageFromCanvasImageSource(canvas)
        this.canvas.drawImageRect(
            imgs,
            this.CanvasKit.LTRBRect(0, 0, canvas.width, canvas.height), // original size of the image
            this.CanvasKit.LTRBRect(0, 0, 800, 800), // scaled down
            null!
        )
        imgs.delete()
    }

    flush() {
        this.Surface.flush()
        this.canvas.clear(this.CanvasKit.Color(0, 0, 0, 0))
    }

}
