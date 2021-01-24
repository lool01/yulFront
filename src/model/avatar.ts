


export class Avatar {
  x: number;
  y: number;
  image: string;
  type: number;
  positionsToGo: any;
  currentObjective: any;
  currentDirection = null;
  isAccident = false;

  constructor(x: number, y: number, image: string, type: number, positionstoGo) {
    this.image = image;
    this.x = x;
    this.y = y;
    this.type = type;
    this.positionsToGo = positionstoGo;
    this.currentObjective = 0;
  }


}
