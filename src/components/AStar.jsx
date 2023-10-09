import { useState, useEffect } from "react";

export default function AStar() {
  const [width, setWidth] = useState(10);
  const [height, setHeight] = useState(10);
  const [start, setStart] = useState(0);
  const [target, settarget] = useState(width * height - 1);
  const [func, setFunc] = useState(() => manhattanDistance);

  useEffect(() => {
    setStart(0);
    settarget(width * height - 1);
  }, [width, height]);

  function getCoords(node) {
    const x = Math.floor(node / width);
    const y = node % width;

    return [x, y];
  }

  function manhattanDistance(current, target) {
    const currentCoords = getCoords(current);
    const targetCoords = getCoords(target);
    return (
      Math.abs(currentCoords[0] - targetCoords[0]) +
      Math.abs(currentCoords[1] - targetCoords[1])
    );
  }

  function shortestDistance(current, target) {
    const currentCoords = getCoords(current);
    const targetCoords = getCoords(target);

    return Math.sqrt(
      Math.pow(currentCoords[0] - targetCoords[0], 2) +
        Math.pow(currentCoords[1] - targetCoords[1], 2)
    );
  }

  function reconstructPath(cameFrom, current) {
    const total_path = [current];

    while (current in cameFrom) {
      current = cameFrom[current];
      total_path.push(current);
    }
    return total_path;
  }

  function getNeighbours(node) {
    const neighbours = [];

    // top neighbour
    if (node >= width) {
      neighbours.push(node - width);
    }
    // bottom neighobur
    if (node < width * height - 1 - width) {
      neighbours.push(node + width);
    }
    // left neighbour
    if (node % width != 0) {
      neighbours.push(node - 1);
    }
    // right neighbour
    if (node % width != width - 1) {
      neighbours.push(node + 1);
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
        return reconstructPath(cameFrom, current);
      }

      getNeighbours(current).forEach((neighbour) => {
        const tentativeGScore = gScore[current] + 1;
        if (tentativeGScore < gScore[neighbour]) {
          cameFrom[neighbour] = current;
          gScore[neighbour] = tentativeGScore;
          fScore[neighbour] = tentativeGScore + h(neighbour, target);

          if (!(neighbour in openSet)) {
            openSet.add(neighbour);
          }
        }
      });
    }

    return null;
  }

  console.log(
    [...Array(height).keys()].map((i) => {
      return [...Array(width).keys()].map((j) => {
        return `${i}${j}`;
      });
    })
  );
  return (
    <div>
      <button onClick={() => console.log(aStar(func))}>Process</button>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${width}, 20px)`,
          gap: "5px",
        }}
      >
        {[...Array(height).keys()].map((i) => {
          return [...Array(width).keys()].map((j) => {
            return (
              <div key={`${i}${j}`}>
                {i}
                {j}
              </div>
            );
          });
        })}
      </div>
    </div>
  );
}
