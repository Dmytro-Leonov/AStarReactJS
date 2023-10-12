import { useState, useEffect } from "react";

export default function AStar() {
  const [width, setWidth] = useState(10);
  const [height, setHeight] = useState(10);
  const [start, setStart] = useState(0);
  const [target, setTarget] = useState(width * height - 1);
  const [func, setFunc] = useState(() => euclideanDistance);
  const [path, setPath] = useState(new Set());
  const [obstacles, setObstacles] = useState(new Set());
  const [allowDiagonal, setAllowDiagonal] = useState(false);
  const [allowGoingBetweenCorners, setAllowGoingBetweenCorners] =
    useState(false);

  useEffect(() => {
    setPath(new Set());
    aStar(func);
  }, [obstacles, func, start, target, allowDiagonal, allowGoingBetweenCorners]);

  useEffect(() => {
    setPath(new Set());
    setObstacles(new Set());
    setStart(0);
    setTarget(width * height - 1);
  }, [width, height]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "KeyC") {
        clearObstacles();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  /**
   * @param {number} node - Node
   * @returns {number[]} - Coordinates of the node
   */
  function getCoords(node) {
    const x = Math.floor(node / width);
    const y = node % width;

    return [x, y];
  }

  /**
   * @param {number} current - Current node
   * @returns {number} - Manhattan distance between current and target nodes
   */
  function manhattanDistance(current) {
    const currentCoords = getCoords(current);
    const targetCoords = getCoords(target);
    return (
      Math.abs(currentCoords[0] - targetCoords[0]) +
      Math.abs(currentCoords[1] - targetCoords[1])
    );
  }

  /**
   * @param {number} current - Current node
   * @returns {number} - Euclidean distance between current and target nodes
   */
  function euclideanDistance(current) {
    return distanceBetweenPoints(current, target);
  }

  /**
   * @param {number} current - Current node
   * @param {number} neighbour - Neighbour node
   * @returns {number} - Euclidean distance between current and neighbour nodes
   */
  function distanceBetweenPoints(current, neighbour) {
    const currentCoords = getCoords(current);
    const neighbourCoords = getCoords(neighbour);

    return Math.sqrt(
      Math.pow(currentCoords[0] - neighbourCoords[0], 2) +
        Math.pow(currentCoords[1] - neighbourCoords[1], 2)
    );
  }

  /**
   * @param {object} cameFrom - Object with nodes as keys and their parents as values
   * @param {number} current - Current node
   */
  function reconstructPath(cameFrom, current) {
    const path = [current];

    while (current in cameFrom) {
      current = cameFrom[current];
      path.push(current);
    }
    setPath(new Set(path));
  }

  /**
   * @param {number} node - Node
   * @returns {number[]} - Neighbours of the node
   */
  function getNeighbours(node) {
    const neighbours = [];

    // top neighbour
    const top = node - width;
    const topIsAvailable = node >= width;
    const topObstacle = obstacles.has(top);
    if (topIsAvailable && !topObstacle) {
      neighbours.push(node - width);
    }
    // bottom neighobur
    const bottom = node + width;
    const bottomIsAvailable = node < width * height - width;
    const bottomObstacle = obstacles.has(bottom);
    if (bottomIsAvailable && !bottomObstacle) {
      neighbours.push(bottom);
    }
    // left neighbour
    const left = node - 1;
    const leftIsAvailable = node % width != 0;
    const leftObstacle = obstacles.has(left);
    if (leftIsAvailable && !leftObstacle) {
      neighbours.push(left);
    }
    // right neighbour
    const right = node + 1;
    const rightIsAvailable = node % width != width - 1;
    const rightObstacle = obstacles.has(right);
    if (rightIsAvailable && !rightObstacle) {
      neighbours.push(right);
    }

    if (allowDiagonal) {
      // top left neighbour
      const topLeft = node - width - 1;
      const canGoTopLeftIfGoingBetweenCornersIsAllowed =
        allowGoingBetweenCorners ||
        (!allowGoingBetweenCorners && (!leftObstacle || !topObstacle));

      if (
        topIsAvailable &&
        leftIsAvailable &&
        canGoTopLeftIfGoingBetweenCornersIsAllowed &&
        !obstacles.has(topLeft)
      ) {
        neighbours.push(topLeft);
      }

      // top right neighbour
      const topRight = node - width + 1;
      const canGoTopRightIfGoingBetweenCornersIsAllowed =
        allowGoingBetweenCorners ||
        (!allowGoingBetweenCorners && (!rightObstacle || !topObstacle));

      if (
        topIsAvailable &&
        rightIsAvailable &&
        canGoTopRightIfGoingBetweenCornersIsAllowed &&
        !obstacles.has(topRight)
      ) {
        neighbours.push(topRight);
      }

      // bottom left neighbour
      const bottomLeft = node + width - 1;
      const canGoBottomLeftIfGoingBetweenCornersIsAllowed =
        allowGoingBetweenCorners ||
        (!allowGoingBetweenCorners && (!leftObstacle || !bottomObstacle));

      if (
        bottomIsAvailable &&
        leftIsAvailable &&
        canGoBottomLeftIfGoingBetweenCornersIsAllowed &&
        !obstacles.has(bottomLeft)
      ) {
        neighbours.push(bottomLeft);
      }

      // bottom right neighbour
      const bottomRight = node + width + 1;
      const canGoBottomRightIfGoingBetweenCornersIsAllowed =
        allowGoingBetweenCorners ||
        (!allowGoingBetweenCorners && (!rightObstacle || !bottomObstacle));

      if (
        bottomIsAvailable &&
        rightIsAvailable &&
        canGoBottomRightIfGoingBetweenCornersIsAllowed &&
        !obstacles.has(bottomRight)
      ) {
        neighbours.push(bottomRight);
      }
    }

    return neighbours;
  }

  /**
   * @param {function} h - Heuristic function
   */
  function aStar(h) {
    const openSet = new Set([start]);
    const cameFrom = {};
    const gScore = {};
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
        const tentativeGScore =
          gScore[current] + distanceBetweenPoints(current, neighbour);
        if (!(neighbour in gScore) || tentativeGScore < gScore[neighbour]) {
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

  /**
   * @param {number} node - Node
   */
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

  /**
   * @param {MouseEvent} e
   * @param {number} node
   */
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

  function clearObstacles() {
    setObstacles(new Set());
  }

  /**
   * @param {number} node - Node
   * @returns {string} - Color of the node
   */
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
    <div className="flex gap-5">
      <div>
        <div className="flex gap-2 items-center">
          <p>Width:</p>
          <input
            type="range"
            min={2}
            max={30}
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
            max={30}
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
                onChange={() => setFunc(() => euclideanDistance)}
                defaultChecked
              />
              Euclidean distance
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
        </div>
        <div>
          <label className="flex gap-2">
            <input
              type="checkbox"
              name="diagonal"
              onChange={() => setAllowDiagonal(!allowDiagonal)}
              checked={allowDiagonal}
            />
            Allow diagonal movement
          </label>
        </div>
        <div>
          <label className="flex gap-2">
            <input
              type="checkbox"
              name="corners"
              onChange={() =>
                setAllowGoingBetweenCorners(!allowGoingBetweenCorners)
              }
              checked={allowGoingBetweenCorners}
            />
            Allow going between corners (when &quot;Allow diagonal
            movement&quot; is enabled)
          </label>
        </div>
        <div>
          <p>change start: Ctrl+mouse1</p>
          <p>change target: Shift+mouse1</p>
          <p>add obstacles: mouse1</p>
          <p>remove obstacles: mouse2</p>
        </div>
        <div>
          <button onClick={clearObstacles}>Clear obstacles (C)</button>
        </div>
        <div>
          <p>Shortest path: {path.size ? path.size - 1 : "-"}</p>
        </div>
      </div>
      <div className="">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${width}, 30px)`,
            gridTemplateRows: `repeat(${height}, 30px)`,
            gap: "1px",
          }}
          className="w-max bg-gray-400 select-none"
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
