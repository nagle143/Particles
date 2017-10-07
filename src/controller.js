import Particle from './particle.js';

export default class Controller {
  constructor() {
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

    //Loop
    this.interval = setInterval(this.loop, 10);
  }

  createParticles() {
    var x;
    var y;
    var radius;
    var mass;
    var id = 0;

    while(this.particles.length <= 15) {
      var collision = false;
      x = Math.floor(Math.random() * 900) + 50;
      y = Math.floor(Math.random() * 900) + 50;
      radius = Math.floor(Math.random() * 30 + 10);
      mass = Math.floor(Math.random() * 10);
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
    console.log(this.particles);
  }

  update() {

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
