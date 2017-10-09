/*
Block = Brick = Rectangle
circle = particle
*/

import Particle from './particle.js';
import Block from './block.js';


/** @class Controller
  * Class that controls everything, creation/deletion of objects and collsions
  */
export default class Controller {
  /** @constructor
  * Sets all of the most important variables and sets up the canvas objects
  */
  constructor() {
    //Prevent the app from crashing by trying to put more objects than there is space
    this.MAX_PARTICLES = 100;
    this.MAX_BLOCKS = 15;
    //Variables to keep track of the objects
    this.numParticles = 20;
    this.numBlocks = 5;
    //Variable for display, percentage the current state of particles velocities are amplified
    this.amplified = 100;
    //Arrays of objects
    this.particles = [];
    this.blocks = [];
    //Functions that handle creating objects
    this.createParticles();
    this.createBlocks();

    //HUD
    this.HUDcanvas = document.getElementById('ui');
    this.HUDcanvas.width = 200;
    this.HUDcanvas.height = 1000;
    this.HUDcontext = this.HUDcanvas.getContext('2d');
    document.body.appendChild(this.HUDcanvas);
    //Sets up the static instructions part of the HUD;
    this.initHUD();
    //Back Buffer
    this.backBufferCanvas = document.getElementById("canvas");
    this.backBufferCanvas.width = 1000;
    this.backBufferCanvas.height = 1000;
    this.backBufferContext = this.backBufferCanvas.getContext('2d');

    //Canvas that actually gets put on the screen
    this.screenBufferCanvas = document.getElementById("canvas");
    this.screenBufferCanvas.width = 1000;
    this.screenBufferCanvas.height = 1000;
    document.body.appendChild(this.screenBufferCanvas);
    this.screenBufferContext = this.screenBufferCanvas.getContext('2d');

    //Binding Functions
    this.update = this.update.bind(this);
    this.render = this.render.bind(this);
    this.loop = this.loop.bind(this);
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

    //App Loop
    this.interval = setInterval(this.loop, 10);
  }

  /** @function handKeyDown()
    * @params event
    * function that handles all the key inputs
    */
  handKeyDown(event) {
    event.preventDefault();
    switch (event.key) {
      //Adds Blocks
      case 'b':
      case 'B':
        if(this.numBlocks < this.MAX_BLOCKS) {
          this.addRect();
          this.numBlocks++;
        }
        break;
      //Removes Blocks
      case 'n':
      case 'N':
        if(this.numBlocks > 0) {
          this.removeBlock();
          this.numBlocks--;
        }
        return;
      //Adds Particles
      case '+':
        if(this.numParticles < this.MAX_PARTICLES) {
          this.addParticle();
          this.numParticles++;
        }
        break;
      //Removes Particles
      case '-':
        if(this.numParticles > 0) {
          this.removeParticle();
          this.numParticles--;
        }
        break;
      //Amplifies the speed of all particles in the current array
      case '*':
        this.particles.forEach(particle => {
          particle.speed.x *= 1.10;
          particle.speed.y *= 1.10;
        });
        this.amplified *= 1.10;
        break;
      //Diminishes the speed of all particles in the current array
      case '/':
        this.particles.forEach(particle => {
          particle.speed.x *= 0.90;
          particle.speed.y *= 0.90;
        });
        this.amplified *= 0.90;
        break;
    }
  }

  /** @function createParticles()
    * Function to initialize the array of particles by calling the addParticle function until numParticles is met
    */
  createParticles() {
    while(this.particles.length < this.numParticles) {
      this.addParticle();
    }
  }

  /** @function addParticle()
    * Function to add new particle to the list while making sure it is not spawned where a object already is
    */
  addParticle() {
    //Variables to establish the particle
    var x;
    var y;
    var radius;
    var mass;
    //Pretty much useless, only for early debugging
    var id = 0;
    //Var to control the while loop
    var currLength = this.particles.length;
    //Loop that generates random values for the particle and makes sure the space is not already occupied
    while (currLength === this.particles.length) {
      //Var to determine if it would have spawned inside something
      var collision = false;
      x = this.random(50, 900);
      y = this.random(50, 900);
      //Use a dumby radius to ensure no overlap with anything, radius is actually set based on mass
      radius = 45;
      mass = this.randomInt(1, 10);
      //Checks if the position is occupied by another particle
      this.particles.forEach(particle => {
        if(particle.collisionDetection(x, y, radius)) {
          collision = true;
        }
      });
      //Checks if the position is occupied by a block
      this.blocks.forEach(block => {
        if(this.ballBrickCollision(x, y, radius, block.x, block.y, block.width, block.height)) {
          collision = true;
        }
      });
      //If collision is still false, the space is open
      if(!collision) {
        this.particles.push(new Particle(x, y, mass, id));
        id++;
      }
    }
    //Updates the Amplied variable because it only tracks the current state of the particles
    this.amplified = 100;
  }

/** @function createBlocks()
  * Function to populate the blocks array by calling addRect until numBlocks is met
  */
  createBlocks() {
    while(this.blocks.length < this.numBlocks) {
      this.addRect();
    }
  }

  /** @function addRect()
    * Function to add a new block/rectangle to the blocks array and makes sure the space is clear
    */
  addRect() {
    //Vars to create a new block
    var x;
    var y;
    var width;
    var height;
    //Var to control the loop below
    var currLength = this.blocks.length;
    //Loop that randomizes values and checks if the space is clear to add the block
    //Operates the same as addParticle but for Rectangles
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

  /** @function ballBrickCollision()
    * Function to determine if a particle and Rectangle are overlapping
    * @param float cx is the x position of the center of the circle
    * @param float cy is the y position of the center of the circle
    * @param int cRadius is the radius of the circle
    * @param float bx is the x position of the top left corner of the block
    * @param float by is the y position of the top left corner of the block
    * @param int bWidth is the width of the block in pixels
    * @param int bHeight is the height of the block in pixels
    * Additional Note - I broke up the params all the way to use this function when creating blocks and particles
    * without having to create a object prior to calling the function. Kinda Messy honestly, but it worked out.
    */
  ballBrickCollision(cx, cy, cRadius, bx, by, bWidth, bHeight) {
    //Assign the particle and Block to vars for easier use
    var particle = {x: cx, y: cy, radius: cRadius};
    var block = {x: bx, y: by, width: bWidth, height: bHeight}
    //Var to hold the center of the rectangle
    var bCenter = {x: block.x + block.width * 0.5, y: block.y + block.height * 0.5};
    //distance between centers in by X and Y axis
    var dx = Math.abs(particle.x - bCenter.x);
    var dy = Math.abs(particle.y - bCenter.y);

    //Checks if the X distance is close
    if(dx > block.width * 0.5 + particle.radius) {
      return false;
    }
    //Checks if the Y distance is close
    if(dy > block.height * 0.5 + particle.radius) {
      return false;
    }
    //If distance is less half the block width then there is a collision
    if(dx <= block.width * 0.5) {
      return true;
    }
    //Same for the y direction
    if(dy <= block.height * 0.5) {
      return true;
    }

    //distance from the torner of the rectangle
    var cornerDistance = Math.pow(dx - block.width * 0.5, 2) + Math.pow(dy - block.height * 0.5, 2);
    //Checks if the cornerDistance is less than the radius
    return (cornerDistance <= particle.radius * particle.radius);
  }

  /** @function resolveBlockCollision()
    * Function to resolve a collision between a particle and a block
    * @param particle pID is the index of the particular particle in question
    * @param block bID is the index of the block in question
    * Still needs to be cleaned up and fix how it handles corner collisions, as of now it doesn't break on corners but doesn't handle them well.
    */
  resolveBlockCollision(pID, bID) {
    //var particle = this.particles[pID];
    //var block = this.blocks[bID];

    //distance between the objects' centers
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
      //Something is wrong with this, i don't know what though...
      var deltaX = this.particles[pID].x - corner.x;
      var deltaY = this.particles[pID].y - corner.y;
      var c  = -2 * (this.particles[pID].speed.x * deltaX + this.particles[pID].speed.y * deltaY) / (deltaX * deltaX + deltaY * deltaY);
      this.particles[pID].speed.x = this.particles[pID].speed.x + c * deltaX;
      this.particles[pID].speed.x = this.particles[pID].speed.y + c * deltaY;
    }
  }

  /** @function removeParticle()
    * function to remove a particle from the list
    */
  removeParticle() {
    this.particles.pop();
  }

  /** @function removeBlock()
    * Function to remove a block from the list
    */
  removeBlock() {
    this.blocks.pop();
  }

  /** @function rotate()
    * Function to change the velocities to make the collisions act like 1-dimensional particles
    * @param velocity is the x and y velocities of the particle
    * @param float angle is the offest needed to adjust for
    */
  rotate(velocity, angle) {
    const rotatedVelocities = {
        x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
        y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
    };
    return rotatedVelocities;
  }

  /** @function particleCollision()
    * Function to handle particle to particle collisions
    * @param particle is the first particle in question
    * @param particle otherParticle is the other particle in question
    */
  particleCollision(particle, otherParticle) {
    //Vars to determine the differences in velocities
    var xVelocityDiff = particle.speed.x - otherParticle.speed.x;
    var yVelocityDiff = particle.speed.y - otherParticle.speed.y;
    //Vars to determine the distances between particles
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
        particle.speed.x = vFinal1.x;
        particle.speed.y = vFinal1.y;
        otherParticle.speed.x = vFinal2.x;
        otherParticle.speed.y = vFinal2.y;
    }
  }

  /** @function random()
    * Function to get a random number between to values
    * @param int min is the minimum desired value
    * @param int max is the maximum desired value
    */
  random(min, max) {
    return Math.random() * (max - min) + min;
  }

  /** @function randomInt()
    * @param int min is the minimum desire value
    * @param int max is the maximum desire value
    */
  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  /** @function drawHUD()
    * Function to draw the HUD that Updates
    */
  drawHUD() {
    this.HUDcontext.fillStyle = 'black';
    this.HUDcontext.fillRect(0, 0, 200, 500);
    this.HUDcontext.strokeStyle = 'green';
    this.HUDcontext.font = '30px Times New Roman';
    this.HUDcontext.strokeText("Particles: " + this.numParticles, 10,100);
    this.HUDcontext.strokeText("Blocks: " + this.numBlocks, 10,200);
    this.HUDcontext.strokeText("Speed: " + Math.floor(this.amplified) + "%", 10,300);
  }

  /** @function initHUD()
    * function to initialize the static HUD/instructions
    */
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
    this.HUDcontext.font = '15px Times New Roman';
    this.HUDcontext.strokeText("**Changing Speed Only", 10, 900);
    this.HUDcontext.strokeText("  Affects On-Screen", 10, 930);
    this.HUDcontext.strokeText("  Particles**", 10, 960);
  }

  /** @function update()
    * function update function that calls the other update functions and the collision functions
    */
  update() {
    //Updates all the particles
    this.particles.forEach(particle => {
      particle.update();
    });
    //Checks for collisions between particles
    for(var i = 0; i < this.particles.length; i++) {
      for(var j = 0; j < this.particles.length; j++) {
        if(i != j) {
          if(this.particles[i].collisionDetection(this.particles[j].x, this.particles[j].y, this.particles[j].radius)) {
            this.particleCollision(this.particles[i], this.particles[j]);
          }
        }
      }
    }
    //Checks for collisions between particles and Blocks
    for(var x = 0; x < this.particles.length; x++) {
      for(var z = 0; z < this.blocks.length; z++) {
        if(this.ballBrickCollision(this.particles[x].x, this.particles[x].y, this.particles[x].radius,
          this.blocks[z].x, this.blocks[z].y, this.blocks[z].width, this.blocks[z].height)) {
            this.resolveBlockCollision(x, z);
          }
      }
    }
  }

  /** @function render()
    * Function to call all the othe render functions and drawHUD function
    */
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

  /** @function loop()
    * function to handle the 'clock' of the app
    */
  loop() {
    this.update();
    this.render();
  }
}
