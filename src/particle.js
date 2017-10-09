

export default class Particle {
  constructor(x, y, radius, mass, id) {
    this.x = x;
    this.y = y;
    this.radius;
    this.mass = mass;
    this.color;
    this.edgeColor;
    this.energyLevel = 0.1;
    this.opacity = 0.2;
    this.initColorAndRadius();
    this.ID = id;
    this.speed = {x: 0.0, y: 0.0};
    this.MAXSPEED = {x: 20, y: 20};
    this.initSpeed();
    this.velocity = {mag: 0.0, energy: 0.0};
    this.temp = {x: this.x, y: this.y, radius: this.radius};
    //console.log(this.temp);

    //Binders
    this.getRadius = this.getRadius.bind(this);
    this.getMass = this.getMass.bind(this);
    this.update = this.update.bind(this);
    this.render = this.render.bind(this);
    this.collisionDetection = this.collisionDetection.bind(this);
    this.edgeDetection = this.edgeDetection.bind(this);
    this.initSpeed = this.initSpeed.bind(this);
    this.initColor = this.initColorAndRadius.bind(this);
    this.updateSpeed = this.updateSpeed.bind(this);
  }

  getRadius() {
    return this.radius;
  }

  getMass() {
    return this.mass;
  }

  initSpeed() {
    this.speed.x = Math.random() * 8 - 4;
    this.speed.y = Math.random() * 8 - 4;
  }

  updateSpeed(x, y) {
    if(Math.abs(x) > this.MAXSPEED.x) {
      this.speed.x = 20;
    }
    else {
      this.speed.x = x;
    }
    if(Math.abs(y) > this.MAXSPEED.y) {
      this.speed.s = 20;
    }
    else {
      this.speed.y = y;
    }
  }

  initColorAndRadius() {
    switch (this.mass) {
      case 1:
      case 2:
      case 3:
        this.radius = 10;
        this.color = 'yellow';
        break;
      case 4:
        this.radius = 15;
        this.color = 'orange';
        break;
      case 5:
        this.radius = 20;
        this.color = 'red';
        break;
      case 6:
        this.radius = 25;
        this.color = 'violet';
        break;
      case 7:
        this.radius = 30;
        this.color = 'blue';
        break;
      case 8:
      case 9:
      case 10:
        this.radius = 40;
        this.color = "green";
        break;
      default:
        this.color = "cyan";
        this.radius = 30;
        this.opacity = 1.0;
    }
  }

  collisionDetection(cx, cy, cradius) {
    var distance = Math.pow(this.x - cx, 2) + Math.pow(this.y - cy, 2);
    if(distance < Math.pow(this.radius + cradius, 2)) {
      return true;
    }
    return false;
  }

  edgeDetection() {
    if(this.x + this.radius >= 1000 && this.speed.x > 0) {
      this.speed.x = -this.speed.x;
    }
    if(this.x - this.radius <= 0 && this.speed.x < 0) {
      this.speed.x = -this.speed.x;
    }
    if(this.y + this.radius >= 1000 && this.speed.y > 0) {
      this.speed.y = -this.speed.y;
    }
    if(this.y - this.radius <= 0 && this.speed.y < 0) {
      this.speed.y = -this.speed.y;
    }
  }

  determineEdge() {
    if(this.velocity.mag <= 3) {
      this.edgeColor = 'red';
    }
    else if(this.velocity.mag > 3 && this.velocity.mag <= 5) {
      this.edgeColor = 'orange';
    }
    else if(this.velocity.mag > 5 && this.velocity.mag <= 7) {
      this.edgeColor = 'cyan';
    }
    else if(this.velocity.mag > 9 && this.velocity.mag <= 12) {
      this.edgeColor = 'yellow';
    }
    else if(this.velocity.mag > 12 && this.velocity.mag <= 15) {
      this.edgeColor = 'white';
    }
    else {
      this.edgeColor = 'blue';
    }
  }

  determineKinetic() {
    if(this.velocity.energy <= 15) {
      this.energyLevel = 0.1;
    }
    else if(this.velocity.energy > 15 && this.velocity.energy <= 25) {
      this.energyLevel = 0.20;
    }
    else if(this.velocity.energy > 25 && this.velocity.energy <= 35) {
      this.energyLevel = 0.30;
    }
    else if(this.velocity.energy > 35 && this.velocity.energy <= 45) {
      this.energyLevel = 0.40;
    }
    else {
      this.energyLevel = 0.50;
    }
  }

  update() {
    this.edgeDetection();
    this.x += this.speed.x;
    this.y += this.speed.y;
    this.velocity.mag = Math.sqrt(this.speed.x * this.speed.x + this.speed.y * this.speed.y);
    this.velocity.energy = 0.5 * this.mass * this.velocity.mag * this.velocity.mag;
    this.determineEdge();
    this.determineKinetic();
  }

  render(context) {
    context.save();
    context.font = "15px Times New Roman";
    context.strokeStyle = this.edgeColor;
    context.fillStyle = this.color;
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    context.closePath();
    context.stroke();
    context.beginPath();
    context.arc(this.x, this.y, this.radius * this.energyLevel, 0, Math.PI * 2);
    context.closePath();
    context.save();
    context.globalAlpha = 1.0;
    context.fill();
    context.restore();
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    context.closePath();
    context.save();
    context.globalAlpha = this.opacity;
    context.fill();
    context.restore();
    //context.strokeText(this.ID, this.x, this.y)
    context.restore();
  }
}
