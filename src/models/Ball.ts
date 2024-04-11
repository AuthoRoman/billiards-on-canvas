export class Ball {
  x: number;
  y: number;
  radius: number;
  color: string;
  name: Symbol;

  vx: number; // Скорость по оси X
  vy: number; // Скорость по оси Y
  mass: number; // Масса

  constructor(
    x: number,
    y: number,
    radius: number,
    color: string,
    name: Symbol,
    mass: number = 2
  ) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.name = name;

    this.vx = 0; // Инициализация скорости по умолчанию
    this.vy = 0; // Инициализация скорости по умолчанию
    this.mass = mass;
  }
}
