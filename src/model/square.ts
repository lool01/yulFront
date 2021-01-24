export class Square {
  val: number | undefined;
  image: string | undefined;
  value: number | undefined;

  constructor(value: number, image: string) {
    this.image = image;
    this.val = value;
    this.value = value;
  }
}
