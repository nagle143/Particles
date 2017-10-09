
/** @class Block
  * Class that stores all the major information about blocks
  */
export default class Block {
  /** @constructor
    * Initializes all the most important info about blocks
    */
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    //Binders
    this.update = this.update.bind(this);
    this.render = this.render.bind(this);
    this.rectangleCollision = this.rectangleCollision.bind(this);
  }

  /** @function rectangleCollision()
    * Function to handle rectangle on rectangle violence
    * @param float x position of the top left corner of the rectangle being checked against this
    * @param float y position of the top left corner of the rectanle being checked against this
    * @param int width of the rectangle being checked against this (pixels)
    * @param int height of the rectangle being checked against this (pixels)
    */
 rectangleCollision(x, y, width, height) {

    if(this.x + this.width >= x &&
      this.x <= x + width &&
      this.y + this.height >= y &&
      this.y <= y + height) {
        return true;
      }
    return false;
  }

  /** @function update()
    * Rectangles don't do anything but get in the way
    */
  update() {

  }

  /** @function render()
    * Function to draw the rectangle onto the canvas
    */
  render(context) {
    context.save();
    //context.fillStyle = 'green';
    context.strokeStyle = 'green';
    //context.fillRect(this.x, this.y, this.width, this.height);
    context.strokeRect(this.x, this.y, this.width, this.height);
    context.restore();
  }
}
