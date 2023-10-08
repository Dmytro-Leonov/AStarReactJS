import { useState, useEffect } from "react";

export default function AStar() {
  const [width, setWidth] = useState(10);
  const [height, setHeight] = useState(10);
  const [field, setField] = useState([[]]);
  const [start, setStart] = useState({ i: 0, j: 0 });
  const [target, settarget] = useState({ i: width - 1, j: height - 1 });

  useEffect(() => {
    const arr = [];

    for (let i = 0; i < height; i++) {
      const row = [];
      for (let j = 0; j < width; j++) {
        row.push({ i, j });
      }
      arr.push(row);
    }

    setField(arr);
  }, [width, height]);

  function manhattanDistance(current, target) {
    return Math.abs(current.i - target.i) + Math.abs(current.j - target.j);
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

    if (node.i != 0) {
      neighbours.push({ i: node.i - 1, j: node.j });
    }
    if (node.i != height - 1) {
      neighbours.push({ i: node.i + 1, j: node.j });
    }
    if (node.j != 0) {
      neighbours.push({ i: node.i, j: node.j - 1 });
    }
    if (node.j != width - 1) {
      neighbours.push({ i: node.i, j: node.j + 1 });
    }
    return neighbours;
  }

  function aStar(h) {
    const openSet = new Set([JSON.stringify(start)]);
    const cameFrom = {};
    const gScore = new Proxy(
      {},
      {
        get: (target, name) => (name in target ? target[name] : Infinity),
      }
    );
    gScore[JSON.stringify(start)] = 0;
    const fScore = {};
    fScore[JSON.stringify(start)] = h(start, target);

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

      if (current === JSON.stringify(target)) {
        return reconstructPath(cameFrom, current);
      }

      getNeighbours(JSON.parse(current)).forEach((neighbour) => {
        const tentativeGScore = gScore[current] + 1;
        if (tentativeGScore < gScore[JSON.stringify(neighbour)]) {
          cameFrom[JSON.stringify(neighbour)] = current;
          gScore[JSON.stringify(neighbour)] = tentativeGScore;
          fScore[JSON.stringify(neighbour)] =
            tentativeGScore + h(neighbour, target);

          if (!(JSON.stringify(neighbour) in openSet)) {
            openSet.add(JSON.stringify(neighbour));
          }
        }
      });
    }

    return null;
  }

  return (
    <div>
      {JSON.stringify(field)}
      <button onClick={() => console.log(aStar(manhattanDistance))}>
        Process
      </button>
    </div>
  );
}
