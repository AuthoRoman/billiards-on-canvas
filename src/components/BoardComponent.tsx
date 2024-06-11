import React, { FC, useEffect, useRef, useState } from "react";
import boardImage from "../assets/board.jpg";
import { Ball } from "../models/Ball";

interface CanvasProps {
  width: number;
  height: number;
}

const BoardComponent: FC<CanvasProps> = ({ width, height }) => {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const canvasCtxRef = React.useRef<CanvasRenderingContext2D | null>(null);
  const [balls, setBalls] = useState<Ball[]>([]);

  useEffect(() => {
    if (ref.current) {
      canvasCtxRef.current = ref.current.getContext("2d");
    }

    if (ref.current && canvasCtxRef.current) {
      let ctx = canvasCtxRef.current;
      ctx.clearRect(0, 0, width, height);
      const board = new Image();
      board.onload = () => {
        ctx?.drawImage(board, 0, 0, width, height);
        const ballRadius = 10;
        const startX = width / 1.9;
        const startY = height / 4;
        const rowHeight = Math.sqrt(3) * ballRadius;
        const ballsInRow = [5, 4, 3, 2, 1];

        const newBalls: Ball[] = [];
        let count = 0;
        for (let row = 0; row < ballsInRow.length; row++) {
          const ballsInThisRow = ballsInRow[row];
          const rowWidth = ballRadius * (2 * ballsInThisRow - 1);

          for (let col = 0; col < ballsInThisRow; col++) {
            const x = startX - rowWidth / 2 + col * ballRadius * 2;
            const y = startY + row * rowHeight;
            let color: string;
            const name = Symbol();
            if (count === 8) {
              color = "black";
            } else {
              color = count % 2 === 0 ? "orange" : "purple";
            }

            newBalls.push(new Ball(x, y, 10, color, name));

            count += 1;
          }
        }

        setBalls(newBalls);
      };
      board.src = boardImage;
    }
  }, [width, height]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (!canvasCtxRef.current) return;

      const ctx = canvasCtxRef.current;

      const board = new Image();
      board.onload = () => {
        ctx.drawImage(board, 0, 0, width, height);

        balls.forEach((ball) => {
          ctx.beginPath();
          ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
          ctx.fillStyle = ball.color;
          ctx.fill();
          ctx.closePath();
        });
      };
      board.src = boardImage;

      updatePosition();
    }, 1000 / 50);
    return () => clearInterval(intervalId);
    // eslint-disable-next-line
  }, [balls]);

  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const handleMouseMove = debounce((event: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = ref.current!.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    setBalls((prevBalls) => {
      const updatedBalls = [...prevBalls];
      let ballChanged = false;
      for (let i = 0; i < updatedBalls.length; i++) {
        const ball = updatedBalls[i];
        const dx = ball.x - mouseX;
        const dy = ball.y - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < ball.radius) {
          const speedMultiplier = 1;
          updatedBalls[i] = {
            ...ball,
            vx: (ball.x - mouseX) * speedMultiplier,
            vy: (ball.y - mouseY) * speedMultiplier,
          };
          ballChanged = true;
        }
      }
      return ballChanged ? updatedBalls : prevBalls;
    });
  }, 10); // Adjust debounce wait time as needed

  const bitWithAngle = () => {
    balls.forEach((ball) => {
      const friction = 0.92;
      ball.vx *= friction;
      ball.vy *= friction;

      if (ball.x - ball.radius < 60) {
        ball.vx = Math.abs(ball.vx) * friction;
        ball.x = ball.radius + 60;
      } else if (ball.x + ball.radius > width - 50) {
        ball.vx = -Math.abs(ball.vx) * friction;
        ball.x = width - ball.radius - 50;
      }

      if (ball.y - ball.radius < 60) {
        ball.vy = Math.abs(ball.vy) * friction;
        ball.y = ball.radius + 60;
      } else if (ball.y + ball.radius > height - 60) {
        ball.vy = -Math.abs(ball.vy) * friction;
        ball.y = height - ball.radius - 60;
      }

      ball.x += ball.vx;
      ball.y += ball.vy;
    });
  };

  const handleCollisionBetweenBalls = (ball1: Ball, ball2: Ball) => {
    const dx = ball2.x - ball1.x;
    const dy = ball2.y - ball1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= ball1.radius + ball2.radius) {
      const angle = Math.atan2(dy, dx);

      const vx1 = -ball1.vx * Math.cos(angle) - ball1.vy * Math.sin(angle);
      const vy1 = -ball1.vy * Math.cos(angle) - ball1.vx * Math.sin(angle);
      const vx2 = -ball2.vx * Math.cos(angle) - ball2.vy * Math.sin(angle);
      const vy2 = -ball2.vy * Math.cos(angle) - ball2.vx * Math.sin(angle);

      const newVx1 =
        ((ball1.mass - ball2.mass) * vx1 - (ball2.mass + ball2.mass) * vx2) /
        (ball1.mass + ball2.mass);
      const newVx2 =
        ((ball1.mass + ball1.mass) * vx1 + (ball2.mass + ball1.mass) * vx2) /
        (ball1.mass + ball2.mass);
      const newVy1 = vy1;
      const newVy2 = vy2;

      ball1.vx = newVx1 * 1.1;
      ball1.vy = newVy1 * 1.1;
      ball2.vx = newVx2 * 1.1;
      ball2.vy = newVy2 * 1.1;
    }
  };

  const handleCollisionsBetweenBalls = (balls: Ball[]) => {
    for (let i = 0; i < balls.length; i++) {
      for (let j = i + 1; j < balls.length; j++) {
        handleCollisionBetweenBalls(balls[i], balls[j]);
      }
    }
  };

  const updatePosition = () => {
    bitWithAngle();
    handleCollisionsBetweenBalls(balls);
  };

  return (
    <canvas
      height={height}
      width={width}
      ref={ref}
      onMouseMove={handleMouseMove}
    ></canvas>
  );
};

export default BoardComponent;
