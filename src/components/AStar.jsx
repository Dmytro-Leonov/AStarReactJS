import { useState, useEffect } from "react";

export default function AStar() {
  const [width, setWidth] = useState(10);
  const [height, setHeight] = useState(10);
  const [start, setStart] = useState(0);
  const [target, setTarget] = useState(width * height - 1);
  const [func, setFunc] = useState(() => directDistance);
  const [path, setPath] = useState(new Set());
  const [obstacles, setObstacles] = useState(new Set());

  useEffect(() => {
    setPath(new Set());
    aStar(func);
  }, [obstacles, func, start, target]);

  useEffect(() => {
    setPath(new Set());
    setObstacles(new Set());
    setStart(0);
    setTarget(width * height - 1);
  }, [width, height]);

  function getCoords(node) {
    const x = Math.floor(node / width);
    const y = node % width;

    return [x, y];
  }

  function manhattanDistance(current) {
    const currentCoords = getCoords(current);
    const targetCoords = getCoords(target);
    return (
      Math.abs(currentCoords[0] - targetCoords[0]) +
      Math.abs(currentCoords[1] - targetCoords[1])
    );
  }

  function directDistance(current) {
    const currentCoords = getCoords(current);
    const targetCoords = getCoords(target);

    return Math.sqrt(
      Math.pow(currentCoords[0] - targetCoords[0], 2) +
        Math.pow(currentCoords[1] - targetCoords[1], 2)
    );
  }

  function reconstructPath(cameFrom, current) {
    const path = [current];

    while (current in cameFrom) {
      current = cameFrom[current];
      path.push(current);
    }
    setPath(new Set(path));
  }

  function getNeighbours(node) {
    const neighbours = [];

    // top neighbour
    const top = node - width;
    if (node >= width && !obstacles.has(top)) {
      neighbours.push(node - width);
    }
    // bottom neighobur
    const bottom = node + width;
    if (node < width * height - width && !obstacles.has(bottom)) {
      neighbours.push(bottom);
    }
    // left neighbour
    const left = node - 1;
    if (node % width != 0 && !obstacles.has(left)) {
      neighbours.push(left);
    }
    // right neighbour
    const right = node + 1;
    if (node % width != width - 1 && !obstacles.has(right)) {
      neighbours.push(right);
    }

    return neighbours;
  }

  function aStar(h) {
    const openSet = new Set([start]);
    const cameFrom = {};
    const gScore = new Proxy(
      {},
      {
        get: (target, name) => (name in target ? target[name] : Infinity),
      }
    );
    gScore[start] = 0;
    const fScore = {};
    fScore[start] = h(start, target);

    while (openSet.size) {
      let current;
      let min = Infinity;
      openSet.forEach((node) => {
        if (fScore[node] < min) {
          min = fScore[node];
          current = node;
        }
      });
      openSet.delete(current);

      if (current === target) {
        reconstructPath(cameFrom, current);
        return;
      }

      getNeighbours(current).forEach((neighbour) => {
        const tentativeGScore = gScore[current] + 1;
        if (tentativeGScore < gScore[neighbour]) {
          cameFrom[neighbour] = current;
          gScore[neighbour] = tentativeGScore;
          fScore[neighbour] = tentativeGScore + h(neighbour);

          if (!(neighbour in openSet)) {
            openSet.add(neighbour);
          }
        }
      });
    }
  }

  function createObstacle(node) {
    if (node === start || node === target) {
      return;
    }
    obstacles.add(node);
    setObstacles(new Set(obstacles));
  }

  function deleteObstacle(node) {
    obstacles.delete(node);
    setObstacles(new Set(obstacles));
  }

  function handleClick(e, node) {
    if (node === start || node === target) {
      return;
    }

    if (e.ctrlKey && !obstacles.has(node)) {
      setStart(node);
      return;
    }

    if (e.shiftKey && !obstacles.has(node)) {
      setTarget(node);
      return;
    }

    // if lmb is pressed
    if (e.buttons === 1) {
      createObstacle(node);
      return;
    }

    // if rmb is pressed
    if (e.buttons === 2) {
      deleteObstacle(node);
      return;
    }
  }

  function handlePress(e, node) {
    if (node === start || node === target) {
      return;
    }

    if (e.buttons === 1) {
      createObstacle(node);
    } else if (e.buttons === 2) {
      deleteObstacle(node);
    }
  }

  function nodeColor(node) {
    if (node === start) {
      return "#00ff00";
    } else if (node === target) {
      return "#ff0000";
    } else if (path.has(node)) {
      return "#0075ff";
    } else if (obstacles.has(node)) {
      return "#000";
    } else {
      return "#fff";
    }
  }

  return (
    <div>
      <div>
        <div className="flex gap-2 items-center">
          <p>Width:</p>
          <input
            type="range"
            min={2}
            max={100}
            value={width}
            onChange={(e) => setWidth(+e.target.value)}
          />
          <p>{width}</p>
        </div>
        <div className="flex gap-2 items-center">
          <p>Height:</p>
          <input
            type="range"
            min={2}
            max={100}
            value={height}
            onChange={(e) => setHeight(+e.target.value)}
          />
          <p>{height}</p>
        </div>
        <div>
          <p>Choose heuristic function:</p>
          <fieldset className="flex flex-col">
            <label className="flex gap-2">
              <input
                type="radio"
                name="func"
                onChange={() => setFunc(() => directDistance)}
                defaultChecked
              />
              Straight line distance
            </label>
            <label className="flex gap-2">
              <input
                type="radio"
                name="func"
                onChange={() => setFunc(() => manhattanDistance)}
              />
              Manhattan distance
            </label>
          </fieldset>
          <div>
            <p>change start: Ctrl+mouse1</p>
            <p>change target: Shift+mouse1</p>
            <p>add obstacles: mouse1</p>
            <p>remove obstacles: mouse2</p>
          </div>
        </div>
      </div>
      <div className="flex items-center w-full justify-center">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${width}, 30px)`,
            gridTemplateRows: `repeat(${height}, 30px)`,
            gap: "1px",
          }}
          className="p-[1px] w-max bg-gray-400 select-none"
          onContextMenu={(e) => e.preventDefault()}
        >
          {[...Array(height).keys()].map((i) => {
            return [...Array(width).keys()].map((j) => {
              const node = i * width + j;
              return (
                <div
                  key={`${i}${j}`}
                  style={{
                    backgroundColor: nodeColor(node),
                  }}
                  className="flex items-center justify-center w-full h-full hover:bg-gray-600"
                  onMouseDown={(e) => handleClick(e, node)}
                  onMouseMove={(e) => handlePress(e, node)}
                ></div>
              );
            });
          })}
        </div>
      </div>
    </div>
  );
}
