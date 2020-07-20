import { World, System, Component, TagComponent, Types } from 'ecsy';
      
      const getRandomNumber = (number) =>  Math.round(Math.random()*number);
      const NUM_ELEMENTS = 40;
      const SPEED_MULTIPLIER = 0.1;

      const removeEntity = (entity) => {
        setTimeout(() => entity.remove(), getRandomNumber(5000));
      };
      
      let canvas = document.querySelector("canvas");
      let canvasWidth = canvas.width = window.innerWidth;
      let canvasHeight = canvas.height = window.innerHeight;
      let ctx = canvas.getContext("2d");

      window.addEventListener( 'resize', () => {
        canvasWidth = canvas.width = window.innerWidth
        canvasHeight = canvas.height = window.innerHeight;
      }, false );

      window.addEventListener("click", (event) => {
        for (let i = 0; i < NUM_ELEMENTS; i++) {
          const entity = world.createEntity();          
          entity
            .addComponent(Velocity, getRandomVelocity())
            .addComponent(Shape, getRandomShape())
            .addComponent(Position, {x: event.clientX, y: event.clientY})
            .addComponent(Renderable);

          removeEntity(entity);
        }
      })

      class Velocity extends Component {}

      Velocity.schema = {
        x: { type: Types.Number },
        y: { type: Types.Number }
      };

      class Position extends Component {}

      Position.schema = {
        x: { type: Types.Number },
        y: { type: Types.Number }
      };

      class Shape extends Component {}

      Shape.schema = {
        primitive: { type: Types.String, default: 'box' },
        size: { type: Types.Number }
      };


      class Renderable extends TagComponent {}

      class MovableSystem extends System {
        execute(delta, time) {
          this.queries.moving.results.forEach(entity => {
            var velocity = entity.getComponent(Velocity);
            var position = entity.getMutableComponent(Position);
            var halfSize = entity.getComponent(Shape).size / 2;
            position.x += velocity.x * delta;
            position.y += velocity.y * delta;
            

            if (position.x > canvasWidth + halfSize) position.x = - halfSize;
            if (position.x < - halfSize) position.x = canvasWidth + halfSize;
            if (position.y > canvasHeight + halfSize) position.y = - halfSize;
            if (position.y < - halfSize) position.y = canvasHeight + halfSize;
          });
        }
      }

      MovableSystem.queries = {
        moving: {
          components: [Velocity, Position]
        }
      }

      class RendererSystem extends System {
        execute(delta, time) {

          ctx.globalAlpha = 1;
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvasWidth, canvasHeight);

          this.queries.renderables.results.forEach(entity => {
            var shape = entity.getComponent(Shape);
            var position = entity.getComponent(Position);
            if (shape.primitive === 'box') {
              this.drawBox(position, shape.size);
            } else {
              this.drawCircle(position, shape.size);
            }
          });
        }
        
        drawCircle(position, size) {
          ctx.fillStyle = "#888";
          ctx.beginPath();
          ctx.arc(position.x, position.y, size / 2, 0, 2 * Math.PI, false);
          ctx.fill();
          ctx.lineWidth = 1;
          ctx.strokeStyle = "#222";
          ctx.stroke();    
        }
        
        drawBox(position, size) {
          ctx.beginPath();
          ctx.rect(position.x - size / 2, position.y - size / 2, size, size);
          ctx.fillStyle= "#f28d89";
          ctx.fill();
          ctx.lineWidth = 1;
          ctx.strokeStyle = "#800904";
          ctx.stroke();  
        }
      }

      RendererSystem.queries = {
        renderables: { components: [Renderable, Shape] }
      }
      
      var world = new World();
      world
        .registerSystem(MovableSystem)
        .registerSystem(RendererSystem)
        .registerComponent(Renderable)
        .registerComponent(Shape)
        .registerComponent(Velocity)
        .registerComponent(Position);

      function getRandomVelocity() {
        return {
          x: SPEED_MULTIPLIER * (2 * Math.random() - 1), 
          y: SPEED_MULTIPLIER * (2 * Math.random() - 1)
        };
      }
      
      function getRandomShape() {
         return {
           primitive: Math.random() >= 0.5 ? 'circle' : 'box',
           size: getRandomNumber(21)
         };
      }
   
      function run() {
        var time = performance.now();
        var delta = time - lastTime;

        world.execute(delta, time);

        lastTime = time;
        requestAnimationFrame(run);
      }

      var lastTime = performance.now();

      run();
