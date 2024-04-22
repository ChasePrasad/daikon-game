import { Bodies, Body, Engine, Events, Render, Runner, World } from "matter-js";
import { FRUITS } from "./fruits";

const engine = Engine.create();
const render = Render.create({
  engine,
  element: document.body,
  options: {
    wireframes: false,
    background: "#f7f4c8",
    width: 620,
    height: 850
  }
});
const world = engine.world;

const leftWall = Bodies.rectangle(15, 395, 30, 820, {
  isStatic: true,
  render: { fillStyle: "#e6b143" },
});
const rightWall = Bodies.rectangle(605, 395, 30, 820, {
  isStatic: true,
  render: { fillStyle: "#e6b143" },
});
const ground = Bodies.rectangle(310, 820, 620, 30, {
  isStatic: true,
  render: { fillStyle: "#e6b143" },
});
const topLine = Bodies.rectangle(310, 150, 620, 30, {
  name: "topLine",
  isStatic: true,
  isSensor: true,
  render: { fillStyle: "#e6b143" },
});

World.add(world, [leftWall, rightWall, ground, topLine]);

Render.run(render);
Runner.run(engine);

let currentBody = null;
let currentFruit = null;
let disableAction = false;
let interval = null;
let gameEnd = false;

function addFruit() {
  const index = Math.floor(Math.random() * 5);
  const fruit = FRUITS[index];
  const body = Bodies.circle(300, 50, fruit.radius, {
    index: index,
    isSleeping: true,
    render: {
      sprite: { texture: `${fruit.label}.png` }
    },
    restitution: 0.5
  });

  currentBody = body;
  currentFruit = fruit;

  World.add(world, body);
}

window.onkeydown = (event) => {
  if (disableAction || gameEnd) {
    return;
  }

  switch(event.code) {
    case "ArrowLeft":
    case "KeyA":
      if (interval)
        return;

      interval = setInterval(() => {
        if (currentBody.position.x - currentFruit.radius > 40)
          Body.setPosition(currentBody, {
            x: currentBody.position.x - 1,
            y: currentBody.position.y
          });
      }, 5);

      break;

    case "ArrowRight":
    case "KeyD":
      if (interval)
        return;

      interval = setInterval(() => {
        if (currentBody.position.x + currentFruit.radius < 580)
          Body.setPosition(currentBody, {
            x: currentBody.position.x + 1,
            y: currentBody.position.y
          });
      }, 5);

      break;

    case "ArrowDown":
    case "KeyS":
      currentBody.isSleeping = false;
      disableAction = true;
      setTimeout(() => {
        addFruit();
        disableAction = false;
      }, 1000);

      break;
  }
}

window.onkeyup = (event) => {
  switch (event.code) {
    case "ArrowLeft":
    case "KeyA":
    case "ArrowRight":
    case "KeyD":
      clearInterval(interval);
      interval = null;
  }
}

Events.on(engine, "collisionStart", (event) => {
  event.pairs.forEach((collision) => {
    if (!gameEnd && (collision.bodyA.index === collision.bodyB.index)) {
      const index = collision.bodyA.index;

      if (index === FRUITS.length - 1) {
        return;
      }

      World.remove(world, [collision.bodyA, collision.bodyB]);

      const newFruit = FRUITS[index + 1];
      const newBody = Bodies.circle(
        collision.collision.supports[0].x,
        collision.collision.supports[0].y,
        newFruit.radius,
        {
          render: {
            sprite: { texture: `${newFruit.label}.png` }
          },
          index: index + 1
        }
      );

      World.add(world, newBody);
    }

    if (!disableAction && (collision.bodyA.name === "topLine" || collision.bodyB.name === "topLine")) {
      alert("Game over :( (Refresh the Page to Restart");
    } else if (newBody.index === 10) {
      endGame("You win! (Refresh the Page to Restart)");
    }
  });
});

function endGame(message) {
  alert(message);
  gameEnd = true;
}

addFruit();