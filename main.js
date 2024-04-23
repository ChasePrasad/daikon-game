import { Bodies, Body, Engine, Events, Render, Runner, World } from "matter-js";
import { VEGETABLES } from "./vegetables";

const lineColor = "#ff6961";
const engine = Engine.create({
  positionIterations: 20,
  velocityIterations: 20
});
const render = Render.create({
  engine,
  element: document.body,
  options: {
    wireframes: false,
    background: "#ffd1dc",
    width: 620,
    height: 850
  }
});
const world = engine.world;

const leftWall = Bodies.rectangle(15, 395, 30, 910, {
  isStatic: true,
  render: { fillStyle: lineColor },
});
const rightWall = Bodies.rectangle(605, 395, 30, 910, {
  isStatic: true,
  render: { fillStyle: lineColor },
});
const ground = Bodies.rectangle(310, 835, 620, 30, {
  isStatic: true,
  render: { fillStyle: lineColor },
});
const topLine = Bodies.rectangle(310, 150, 620, 30, {
  label: "topLine",
  isStatic: true,
  isSensor: true,
  render: { fillStyle: lineColor },
});

World.add(world, [leftWall, rightWall, ground, topLine]);

Render.run(render);
Runner.run(engine);

let currentBody = null;
let currentVegetable = null;
let disableAction = false;
let interval = null;
let gameEnd = false;

function addVegetable() {
  const index = Math.floor(Math.random() * 3);
  const vegetable = VEGETABLES[index];
  const body = Bodies.circle(300, 70, vegetable.radius, {
    index: index,
    isSleeping: true,
    render: {
      sprite: { texture: `${vegetable.label}.png` }
    },
    restitution: 0.5
  });

  currentBody = body;
  currentVegetable = vegetable;

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
        if (currentBody.position.x - currentVegetable.radius > 40)
          Body.setPosition(currentBody, {
            x: currentBody.position.x - 2,
            y: currentBody.position.y
          });
      }, 5);

      break;

    case "ArrowRight":
    case "KeyD":
      if (interval)
        return;

      interval = setInterval(() => {
        if (currentBody.position.x + currentVegetable.radius < 580)
          Body.setPosition(currentBody, {
            x: currentBody.position.x + 2,
            y: currentBody.position.y
          });
      }, 5);

      break;

    case "ArrowDown":
    case "KeyS":
      currentBody.isSleeping = false;
      disableAction = true;
      setTimeout(() => {
        addVegetable();
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
      const collisionSound = new Audio("plop.flac");

      if (index === VEGETABLES.length - 1) {
        return;
      }

      collisionSound.play();
      World.remove(world, [collision.bodyA, collision.bodyB]);

      const newVegetable = VEGETABLES[index + 1];
      const newBody = Bodies.circle(
        collision.collision.supports[0].x,
        collision.collision.supports[0].y,
        newVegetable.radius,
        {
          render: {
            sprite: { texture: `${newVegetable.label}.png` }
          },
          index: index + 1
        }
      );

      World.add(world, newBody);

      if (newBody.index === 9) {
        setTimeout(() => {
          endGame("You win :) (Refresh the Page to Restart)");
        }, 500);
      }
    }
    if (!disableAction && (collision.bodyA.label === "topLine" || collision.bodyB.label === "topLine")) {
      endGame("Game over :( (Refresh the Page to Restart");
    }
  });
});

function endGame(message) {
  alert(message);
  gameEnd = true;
}

addVegetable();
