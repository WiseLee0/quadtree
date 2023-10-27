import React, { useEffect, useRef } from "react";
import "./drawQuadtree";
import { Indexable, Quadtree, Rectangle } from "./quadtree";
import DrawQuadTree from "./drawQuadtree";
import CanvasKitInit from "canvaskit-wasm";

type Tree = Quadtree<Rectangle<void> | Indexable>;
const CANVAS_WIDTH = 800;
function App() {
  const offscreenRef = useRef<DrawQuadTree>();
  const screenRef = useRef<DrawQuadTree>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const treeRef = useRef<Tree>();
  const rectangleRef = useRef<Rectangle[]>([]);
  const tileRef = useRef<Rectangle[]>([]);
  const boundsRef = useRef<Rectangle["bounds"]>([]);
  const deleteRef = useRef<Rectangle["bounds"]>([]);
  const addRef = useRef<Rectangle["bounds"]>([]);
  const openDirtyRef = useRef(false);
  const loop = () => {
    const offscreen = offscreenRef.current!;
    const screen = screenRef.current!;

    openDirtyRef.current && offscreen.drawDirtyArea(boundsRef.current!);
    offscreen.drawQuadtree(treeRef.current!);
    offscreen.drawObjects(rectangleRef.current!);
    addRef.current && offscreen.drawObjects(addRef.current!, [0, 1, 0, 1]);
    deleteRef.current &&
      offscreen.drawObjects(deleteRef.current!, [1, 0, 0, 1]);
    const canvas = offscreen.getCanvas();
    offscreen.flush();
    screen.drawImage(canvas);
    screen.flush();
    requestAnimationFrame(() => {
      loop();
    });
  };

  const main = async () => {
    const CanvasKit = await CanvasKitInit();

    const scrennCanvas = canvasRef.current!;
    scrennCanvas.width = CANVAS_WIDTH;
    scrennCanvas.height = CANVAS_WIDTH;
    screenRef.current = new DrawQuadTree(CanvasKit, scrennCanvas as any);

    const offscrennCanvas = new OffscreenCanvas(CANVAS_WIDTH, CANVAS_WIDTH);
    offscrennCanvas.width = CANVAS_WIDTH;
    offscrennCanvas.height = CANVAS_WIDTH;
    offscreenRef.current = new DrawQuadTree(CanvasKit, offscrennCanvas as any);

    treeRef.current = new Quadtree({
      x: 0,
      y: 0,
      width: CANVAS_WIDTH,
      height: CANVAS_WIDTH,
      maxObjects: 2,
      maxLevels: 4,
    });
    loop();
  };
  useEffect(() => {
    main();
  }, []);

  const handleAdd = function (num = 1, clearShow = true) {
    openDirtyRef.current = false;
    if (clearShow) {
      addRef.current = [];
      deleteRef.current = [];
    }
    const myTree = treeRef.current!;
    for (let i = 0; i < num; i++) {
      const rect = new Rectangle({
        x: randMinMax(0, myTree.bounds.width - 32),
        y: randMinMax(0, myTree.bounds.height - 32),
        width: randMinMax(4, 32, true),
        height: randMinMax(4, 32, true),
      });
      myTree.insert(rect);
      addRef.current.push(rect);
      rectangleRef.current.push(rect);
      tileRef.current.push(rect);
    }
  };
  const switchShowDirtyTile = () => {
    const arr = [];
    boundsRef.current = [];
    for (let i = 0; i < tileRef.current.length; i++) {
      const rect = tileRef.current[i];
      arr.push(...rect.boundsSet);
    }
    const set = new Set(arr);
    for (const key of set) {
      const [x, y, width, height] = key.split("-").map((i) => +i);
      boundsRef.current.push({
        x,
        y,
        width,
        height,
      });
    }
    tileRef.current = [];
    deleteRef.current = [];
    addRef.current = [];
    openDirtyRef.current = true;
  };

  const handleDelete = (clearShow = true) => {
    openDirtyRef.current = false;
    if (clearShow) {
      deleteRef.current = [];
      addRef.current = [];
    }
    const myTree = treeRef.current!;
    const len = rectangleRef.current.length;
    if (!len) return;
    const rect = rectangleRef.current.splice(
      Math.floor(Math.random() * len),
      1
    )[0];
    const res = myTree.remove(rect);
    deleteRef.current.push(rect);
    tileRef.current.push(...res, rect);
  };

  const handleMove = (num = 1) => {
    const len = rectangleRef.current.length;
    if (len < num) return;
    for (let i = 0; i < num; i++) {
      handleDelete(false);
    }
    handleAdd(num, false);
  };

  const clearup = () => {
    openDirtyRef.current = false;
    const myTree = treeRef.current!;
    myTree.clearup();
  };
  return (
    <div>
      <div>
        <canvas
          ref={canvasRef}
          style={{
            width: CANVAS_WIDTH,
            height: CANVAS_WIDTH,
            backgroundColor: "#000",
          }}
        ></canvas>
        {/* <canvas
          ref={offscreenCanvasRef}
          style={{ width: CANVAS_WIDTH, height: CANVAS_WIDTH, backgroundColor: "#000" }}
        ></canvas> */}
      </div>
      <div style={{ display: "flex", width: CANVAS_WIDTH, flexWrap: "wrap" }}>
        <button
          style={{ marginRight: 20, marginBottom: 20 }}
          onClick={() => handleAdd()}
        >
          添加一个元素
        </button>
        <button
          style={{ marginRight: 20, marginBottom: 20 }}
          onClick={() => handleAdd(10)}
        >
          添加十个元素
        </button>
        <button
          style={{ marginRight: 20, marginBottom: 20 }}
          onClick={() => handleDelete()}
        >
          删除元素
        </button>
        <button
          style={{ marginRight: 20, marginBottom: 20 }}
          onClick={() => handleMove()}
        >
          移动一个元素
        </button>
        <button
          style={{ marginRight: 20, marginBottom: 20 }}
          onClick={() => handleMove(10)}
        >
          移动十个元素
        </button>
        <button
          style={{ marginRight: 20, marginBottom: 20 }}
          onClick={() => switchShowDirtyTile()}
        >
          显示渲染瓦片
        </button>
        <button
          style={{ marginRight: 20, marginBottom: 20 }}
          onClick={() => clearup()}
        >
          整理四叉树
        </button>
      </div>
    </div>
  );
}
export default App;

const randMinMax = (min: number, max: number, round?: boolean) => {
  var val = min + Math.random() * (max - min);

  if (round) val = Math.round(val);

  return val;
};
