export interface CustomShape {
  coordinate: Point[]
  fWidth: number
  fHeight: number
}

export interface Mask {
  width: number;
  height: number;
  points: Point[];
}

export interface Point {
  x: number;
  y: number;
}