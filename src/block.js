

export default class Block {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;


    //Binders
    this.update = this.update.bind(this);
    this.render = this.render.bind(this);
  }

  rectangleCollision(x, y, width, height) {

    if(this.x + this.width >= x &&
      this.x <= x + width &&
      this.y + this.height >= y &&
      this.y <= y + height) {
        return true;
      }
    return false;
  }

  update() {

  }
  render(context) {
    context.save();
    //context.fillStyle = 'green';
    context.strokeStyle = 'green';
    //context.fillRect(this.x, this.y, this.width, this.height);
    context.strokeRect(this.x, this.y, this.width, this.height);
    context.restore();
  }
}
