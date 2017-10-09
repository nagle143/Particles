
/** @class Particle
  * Class that takes care of everything particle related
  */
export default class Particle {
  /** @constructor
    * Initializes all the most important things about a particle
    */
  constructor(x, y, mass, id) {
    //Basic Properties
    this.x = x;
    this.y = y;
    //Determined by mass
    this.radius;
    this.mass = mass;
    //Also Determined by mass
    this.color;
    //Determined by speed
    this.edgeColor;
    //Determined by kinetic energy
    this.energyLevel = 0.1;
    this.opacity = 0.2;
    //Initializes color and radius
    this.initColorAndRadius();
    this.ID = id;
    //Vital speed attribute
    this.speed = {x: 0.0, y: 0.0};
    this.initSpeed();
    //Stores the full magnitude of the particle and kinetic energy
    this.velocity = {mag: 0.0, energy: 0.0};

    //Binders
    this.update = this.update.bind(this);
    this.render = this.render.bind(this);
    this.collisionDetection = this.collisionDetection.bind(this);
    this.edgeDetection = this.edgeDetection.bind(this);
    this.initSpeed = this.initSpeed.bind(this);
    this.initColor = this.initColorAndRadius.bind(this);
  }

  /** @function initSpeed()
    * Function to initialize the x and y speed of the particle
    */
  initSpeed() {
    this.speed.x = Math.random() * 8 - 4;
    this.speed.y = Math.random() * 8 - 4;
  }

  /** @function initColorAndRadius()
    * Function to initialize the color and radius of a particle based on its mass
    */
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

  /** @function collisionDetection()
    * function to hadle particle on particle violence
    * @param float cx is the x position of the circle being checked against this
    * @param float cy is the y position of the circle being checked against this
    * @param int cradius is the radius of the circle being checked against this
    */
  collisionDetection(cx, cy, cradius) {
    var distance = Math.pow(this.x - cx, 2) + Math.pow(this.y - cy, 2);
    if(distance < Math.pow(this.radius + cradius, 2)) {
      return true;
    }
    return false;
  }

  /** @function edgeDetection()
    * function to handle the particle hiting the edge of the area
    */
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

  /** @function determineEdge()
    * Function to determine the color of the edge of the particle based on the velocity magnitude
    */
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

  /** @function determineKinetic()
    * Function to determine the size of the inner circle to represent the kinetic energy of the particle
    */
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

  /** @function update()
    * Function to handle updating the position and colors of each particle
    */
  update() {
    this.edgeDetection();
    this.x += this.speed.x;
    this.y += this.speed.y;
    this.velocity.mag = Math.sqrt(this.speed.x * this.speed.x + this.speed.y * this.speed.y);
    this.velocity.energy = 0.5 * this.mass * this.velocity.mag * this.velocity.mag;
    this.determineEdge();
    this.determineKinetic();
  }

  /** @function render()
    * Function to render the particles
    */
  render(context) {
    //Save entire context before hand
    context.save();
    //If I want to display the id of the particle
    context.font = "15px Times New Roman";
    //Sets the colors of the particles and the edge color
    context.strokeStyle = this.edgeColor;
    context.fillStyle = this.color;
    //Draw the edge od the circle
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    context.closePath();
    context.stroke();
    //Draw the inner circle
    context.beginPath();
    context.arc(this.x, this.y, this.radius * this.energyLevel, 0, Math.PI * 2);
    context.closePath();
    //Make it completely opac
    context.save();
    context.globalAlpha = 1.0;
    context.fill();
    context.restore();
    //Draw the whole particle
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
