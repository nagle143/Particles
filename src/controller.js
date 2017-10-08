import Particle from './particle.js';

export default class Controller {
  constructor() {
    this.numParticles = 25;
    this.totalXspeed = 0;
    this.totalYspeed = 0;
    this.particles = [];
    this.createParticles();
    //Back Buffer
    this.backBufferCanvas = document.createElement('canvas');
    this.backBufferCanvas.width = 1000;
    this.backBufferCanvas.height = 1000;
    this.backBufferContext = this.backBufferCanvas.getContext('2d');

    //Screen canvas
    this.screenBufferCanvas = document.createElement('canvas');
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
    this.handleKeyDown = this.handKeyDown.bind(this);
    window.onkeydown = this.handleKeyDown;

    //Loop
    this.interval = setInterval(this.loop, 10);
  }

  handKeyDown(event) {
    event.preventDefault();
    console.log(event.key);
    switch (event.key) {
      case 'i':
      case 'I':
        console.log(this.particles);
        break;
      case 's':
        this.totalXspeed = 0;
        this.totalYspeed = 0;
        this.particles.forEach(particle => {
          this.totalXspeed += particle.speed.x;
          this.totalYspeed += particle.speed.y;
        });
        console.log(this.totalXspeed);
        console.log(this.totalYspeed);
        break;
      case '+':
        this.addParticle();
        break;
      case '-':
        this.removeParticle();
        break;
      case '*':
        this.particles.forEach(particle => {
          particle.speed.x *= 1.10;
          particle.speed.y *= 1.10;
        });
        break;
      case '/':
        this.particles.forEach(particle => {
          particle.speed.x *= 0.90;
          particle.speed.y *= 0.90;
        });
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
      x = Math.random() * 900 + 50;
      y = Math.random() * 900 + 50;
      radius = 45;
      mass = Math.floor(Math.random() * 10) + 1;
      if(this.particles.length === 0) {
        this.particles.push(new Particle(x, y, radius, mass, id));
        id++;
      }
      else {
        for(var i = 0; i < this.particles.length; i++) {
          if(this.particles[i].collisionDetection(x, y, radius)) {
            collision = true;
          }
        }
        if(!collision) {
          this.particles.push(new Particle(x, y, radius, mass, id));
          id++;
        }
      }
    }
  }

  removeParticle() {
    this.particles.pop();
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
  }

  render() {
    this.backBufferContext.fillStyle = 'black';
    this.backBufferContext.fillRect(0,0,1000,1000);
    this.particles.forEach(particle => {
      particle.render(this.backBufferContext);
    });
    this.screenBufferContext.drawImage(this.backBufferCanvas, 0,0)
  }

  loop() {
    this.update();
    this.render();
  }
}
