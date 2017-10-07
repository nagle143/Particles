

export default class Particle {
  constructor(x, y, radius, mass, id) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.mass = mass;
    this.ID = id;
    this.speedX = 0.0;
    this.speedY = 0.0;
    this.velocity = {mag: 0.0, dir: 0.0};
    this.temp = {x: this.x, y: this.y, radius: this.radius};
    //console.log(this.temp);

    //Binders
    this.getRadius = this.getRadius.bind(this);
    this.getMass = this.getMass.bind(this);
    this.update = this.update.bind(this);
    this.render = this.render.bind(this);
    this.collisionDetection = this.collisionDetection.bind(this);
  }

  getRadius() {
    return this.radius;
  }

  getMass() {
    return this.mass;
  }

  collisionDetection(cx, cy, cradius) {
    var distance = Math.pow(this.x - cx, 2) + Math.pow(this.y - cy, 2);
    if(distance < Math.pow(this.radius + cradius, 2)) {
      return true;
    }
    return false;
  }

  update() {

  }

  render(context) {
    context.save();
    context.font = "15px Times New Roman";
    context.strokeStyle = 'red';
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    context.closePath();
    context.stroke();
    context.strokeText(this.ID, this.x, this.y)
    context.restore();
  }
}
