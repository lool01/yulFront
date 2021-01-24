


export class Avatar {
  x: number;
  y: number;
  image: string;
  type: number;
  positionsToGo: any;
  currentObjective: any;

  constructor(x: number, y: number, image: string, type: number) {
    this.image = image;
    this.x = x;
    this.y = y;
    this.type = type;
    this.positionsToGo = [[9, 8], [3, 21], [16, 14], [29, 22]];
    this.currentObjective = 0;
  }


}
