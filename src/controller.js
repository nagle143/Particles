import Particle from './particle.js';
import Block from './block.js';

export default class Controller {
  constructor() {
    this.MAX_PARTICLES = 100;
    this.MAX_BLOCKS = 15;
    this.numParticles = 20;
    this.numBlocks = 5;
    this.amplified = 100;
    this.particles = [];
    this.blocks = [];
    this.createParticles();
    this.createBlocks();

    //HUD
    this.HUDcanvas = document.getElementById('ui');
    this.HUDcanvas.width = 200;
    this.HUDcanvas.height = 1000;
    this.HUDcontext = this.HUDcanvas.getContext('2d');
    document.body.appendChild(this.HUDcanvas);
    this.initHUD();
    //Back Buffer
    this.backBufferCanvas = document.getElementById("canvas");
    this.backBufferCanvas.width = 1000;
    this.backBufferCanvas.height = 1000;
    this.backBufferContext = this.backBufferCanvas.getContext('2d');

    //Screen canvas
    this.screenBufferCanvas = document.getElementById("canvas");
    this.screenBufferCanvas.width = 1000;
    this.screenBufferCanvas.height = 1000;
    document.body.appendChild(this.screenBufferCanvas);
    this.screenBufferContext = this.screenBufferCanvas.getContext('2d');

    //Binding Functions
    this.update = this.update.bind(this);
    this.render = this.render.bind(this);
    this.loop = this.loop.bind(this);
    //this.calcDistance = this.calcDistance.bind(this);
    this.createParticles = this.createParticles.bind(this);
    this.rotate = this.rotate.bind(this);
    this.particleCollision = this.particleCollision.bind(this);
    this.ballBrickCollision = this.ballBrickCollision.bind(this);
    this.resolveBlockCollision = this.resolveBlockCollision.bind(this);
    this.handleKeyDown = this.handKeyDown.bind(this);
    this.addRect = this.addRect.bind(this);
    this.createBlocks = this.createBlocks.bind(this);
    this.random = this.random.bind(this);
    this.randomInt = this.randomInt.bind(this);
    this.removeBlock = this.removeBlock.bind(this);
    this.initHUD = this.initHUD.bind(this);
    window.onkeydown = this.handleKeyDown;

    //Loop
    this.interval = setInterval(this.loop, 10);
  }

  handKeyDown(event) {
    event.preventDefault();
    //console.log(event.key);
    switch (event.key) {
      case 'b':
      case 'B':
        if(this.numBlocks <= this.MAX_PARTICLES) {
          this.addRect();
          this.numBlocks++;
        }
        break;
      case 'n':
      case 'N':
        if(this.numBlocks > 0) {
          this.removeBlock();
          this.numBlocks--;
        }
        return;
      case '+':
        if(this.numParticles <= this.MAX_PARTICLES) {
          this.addParticle();
          this.numParticles++;
        }
        break;
      case '-':
        if(this.numParticles > 0) {
          this.removeParticle();
          this.numParticles--;
        }
        break;
      case '*':
        this.particles.forEach(particle => {
          particle.speed.x *= 1.10;
          particle.speed.y *= 1.10;
        });
        this.amplified *= 1.10;
        break;
      case '/':
        this.particles.forEach(particle => {
          particle.speed.x *= 0.90;
          particle.speed.y *= 0.90;
        });
        this.amplified *= 0.90;
        break;
    }
  }

  createParticles() {
    while(this.particles.length < this.numParticles) {
      this.addParticle();
    }
  }

  addParticle() {
    var x;
    var y;
    var radius;
    var mass;
    var id = 0;
    var currLength = this.particles.length;
    while (currLength === this.particles.length) {
      var collision = false;
      x = this.random(50, 900);
      y = this.random(50, 900);
      radius = 45;
      mass = this.randomInt(1, 10);
      this.particles.forEach(particle => {
        if(particle.collisionDetection(x, y, radius)) {
          collision = true;
        }
      });
      this.blocks.forEach(block => {
        if(this.ballBrickCollision(x, y, radius, block.x, block.y, block.width, block.height)) {
          collision = true;
        }
      });
      if(!collision) {
        this.particles.push(new Particle(x, y, radius, mass, id));
        id++;
      }
    }
  }

  createBlocks() {
    while(this.blocks.length < this.numBlocks) {
      this.addRect();
    }
  }

  addRect() {
    var x;
    var y;
    var width;
    var height;
    var currLength = this.blocks.length;

    while(currLength === this.blocks.length) {
      var collision = false;
      x = this.random(100, 800);
      y = this.random(100, 800);
      width = this.randomInt(50, 200);
      height = this.randomInt(50, 200);
      this.blocks.forEach(block => {
        if(block.rectangleCollision(x, y, width, height)) {
          collision = true;
        }
      });
      this.particles.forEach(particle => {
        if(this.ballBrickCollision(particle.x, particle.y, particle.radius, x, y, width, height)) {
          collision = true;
        }
      });
      if(!collision) {
        this.blocks.push(new Block(x, y, width, height));
      }
    }
  }

  ballBrickCollision(cx, cy, cRadius, bx, by, bWidth, bHeight) {
    //Assige the particle and Block to vars for easier use
    var particle = {x: cx, y: cy, radius: cRadius};
    var block = {x: bx, y: by, width: bWidth, height: bHeight}
    var bCenter = {x: block.x + block.width * 0.5, y: block.y + block.height * 0.5};
    var dx = Math.abs(particle.x - bCenter.x);
    var dy = Math.abs(particle.y - bCenter.y);

    if(dx > block.width * 0.5 + particle.radius) {
      return false;
    }
    if(dy > block.height * 0.5 + particle.radius) {
      return false;
    }
    if(dx <= block.width * 0.5) {
      return true;
    }
    if(dy <= block.height * 0.5) {
      return true;
    }

    var cornerDistance = Math.pow(dx - block.width * 0.5, 2) + Math.pow(dy - block.height * 0.5, 2);

    return (cornerDistance <= particle.radius * particle.radius);
  }

  resolveBlockCollision(pID, bID) {
    //var particle = this.particles[pID];
    //var block = this.blocks[bID];
    //distance between the objects' centers
    //console.log(particle);
    var dx = this.particles[pID].x - (this.blocks[bID].x + this.blocks[bID].width * 0.5);
    var dy = this.particles[pID].y - (this.blocks[bID].y + this.blocks[bID].height * 0.5);
    var absX = Math.abs(dx);
    var absY = Math.abs(dy);
    //Right Side
    if(dx > 0 && absY <= this.blocks[bID].height * 0.5 && this.particles[pID].speed.x < 0) {
      this.particles[pID].speed.x = -this.particles[pID].speed.x;
    }
    //Left Side
    if(dx < 0 && absY <= this.blocks[bID].height * 0.5 && this.particles[pID].speed.x > 0) {
      this.particles[pID].speed.x = -this.particles[pID].speed.x;
    }
    //Top
    if(dy < 0 && absX <= this.blocks[bID].width * 0.5 && this.particles[pID].speed.y > 0) {
      this.particles[pID].speed.y = -this.particles[pID].speed.y;
    }
    //Bottom
    if(dy > 0 && absX <= this.blocks[bID].width * 0.5 && this.particles[pID].speed.y < 0) {
      this.particles[pID].speed.y = -this.particles[pID].speed.y;
    }
    //A Corner
    if(absX > this.blocks[bID].width * 0.5 && absY > this.blocks[bID].height * 0.5) {
      var corner;
      //Bottom right
      if(dx > 0 && dy > 0) {
        corner = {x: this.blocks[bID].x + this.blocks[bID].width, y: this.blocks[bID].y + this.blocks[bID].height};
      }
      //top right
      else if(dx > 0 && dy < 0) {
        corner = {x: this.blocks[bID].x + this.blocks[bID].width, y: this.blocks[bID].y};
      }
      //top left
      else if(dx < 0 && dy < 0) {
        corner = {x: this.blocks[bID].x, y: this.blocks[bID].y};
      }
      //bottom left
      else {
        corner = {x: this.blocks[bID].x, y: this.blocks[bID].y + this.blocks[bID].height};
      }
      var deltaX = this.particles[pID].x - corner.x;
      var deltaY = this.particles[pID].y - corner.y;
      var c  = -2 * (this.particles[pID].speed.x * deltaX + this.particles[pID].speed.y * deltaY) / (deltaX * deltaX + deltaY * deltaY);
      this.particles[pID].speed.x = this.particles[pID].speed.x + c * deltaX;
      this.particles[pID].speed.x = this.particles[pID].speed.y + c * deltaY;
    }
  }

  removeParticle() {
    this.particles.pop();
  }
  removeBlock() {
    this.blocks.pop();
  }

  rotate(velocity, angle) {
    const rotatedVelocities = {
        x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
        y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
    };
    return rotatedVelocities;
  }

  particleCollision(particle, otherParticle) {
    var xVelocityDiff = particle.speed.x - otherParticle.speed.x;
    var yVelocityDiff = particle.speed.y - otherParticle.speed.y;

    var xDist = otherParticle.x - particle.x;
    var yDist = otherParticle.y - particle.y;

    // Prevent accidental overlap of particles
    if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {

        // Grab angle between the two colliding particles
        var angle = -Math.atan2(otherParticle.y - particle.y, otherParticle.x - particle.x);

        // Store mass in var for better readability in collision equation
        var m1 = particle.mass;
        var m2 = otherParticle.mass;

        // Velocity before equation
        var u1 = this.rotate(particle.speed, angle);
        var u2 = this.rotate(otherParticle.speed, angle);

        // Velocity after 1d collision equation
        var v1 = { x: (u1.x * (m1 - m2) + 2 * m2 * u2.x) / (m1 + m2), y: u1.y };
        var v2 = { x: (u2.x * (m2 - m1) + 2 * m1 * u1.x)/ (m1 + m2), y: u2.y };

        // Final velocity after rotating axis back to original location
        var vFinal1 = this.rotate(v1, -angle);
        var vFinal2 = this.rotate(v2, -angle);

        // Swap particle velocities for realistic bounce effect
        //particle.updateSpeed(vFinal1.x, vFinal2.y);
        //otherParticle.updateSpeed(vFinal2.x, vFinal2.y);
        particle.speed.x = vFinal1.x;
        particle.speed.y = vFinal1.y;
        otherParticle.speed.x = vFinal2.x;
        otherParticle.speed.y = vFinal2.y;
    }
  }

  random(min, max) {
    return Math.random() * (max - min) + min;
  }

  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  drawHUD() {
    this.HUDcontext.fillStyle = 'black';
    this.HUDcontext.fillRect(0, 0, 200, 500);
    this.HUDcontext.strokeStyle = 'green';
    this.HUDcontext.font = '30px Times New Roman';
    this.HUDcontext.strokeText("Particles: " + this.numParticles, 10,100);
    this.HUDcontext.strokeText("Blocks: " + this.numBlocks, 10,200);
    this.HUDcontext.strokeText("Speed: " + Math.floor(this.amplified) + "%", 10,300);
  }

  initHUD() {
    this.HUDcontext.fillStyle = 'black';
    this.HUDcontext.fillRect(0, 500, 200, 500);
    this.HUDcontext.strokeStyle = 'red';
    this.HUDcontext.font = '30px Times New Roman';
    this.HUDcontext.strokeText("KEYS",10, 550);
    this.HUDcontext.font = '20px Times New Roman';
    this.HUDcontext.strokeText("* : Increases Speed", 10, 600);
    this.HUDcontext.strokeText("/ : Decreases Speed", 10, 650);
    this.HUDcontext.strokeText("+ : Adds particle", 10, 700);
    this.HUDcontext.strokeText("- : Removes particle", 10, 750);
    this.HUDcontext.strokeText("B : Adds Block", 10, 800);
    this.HUDcontext.strokeText("N : Removes Block", 10, 850);
  }

  update() {
    this.particles.forEach(particle => {
      particle.update();
    });
    for(var i = 0; i < this.particles.length; i++) {
      for(var j = 0; j < this.particles.length; j++) {
        if(i != j) {
          if(this.particles[i].collisionDetection(this.particles[j].x, this.particles[j].y, this.particles[j].radius)) {
            this.particleCollision(this.particles[i], this.particles[j]);
          }
        }
      }
    }
    for(var x = 0; x < this.particles.length; x++) {
      for(var z = 0; z < this.blocks.length; z++) {
        if(this.ballBrickCollision(this.particles[x].x, this.particles[x].y, this.particles[x].radius,
          this.blocks[z].x, this.blocks[z].y, this.blocks[z].width, this.blocks[z].height)) {
            this.resolveBlockCollision(x, z);
          }
      }
    }
  }

  render() {
    this.backBufferContext.fillStyle = 'black';
    this.backBufferContext.strokeStyle = 'green';
    this.backBufferContext.fillRect(0,0,1000,1000);
    this.backBufferContext.strokeRect(0,0,1000,1000);
    this.particles.forEach(particle => {
      particle.render(this.backBufferContext);
    });
    this.blocks.forEach(block => {
      block.render(this.backBufferContext);
    });
    this.screenBufferContext.drawImage(this.backBufferCanvas, 0,0);
    this.drawHUD();
  }

  loop() {
    this.update();
    this.render();
  }
}
