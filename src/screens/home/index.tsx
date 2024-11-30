import { useEffect, useRef, useState } from "react";
import { SWATCHES } from "@/constants";
import { ColorSwatch, Group } from "@mantine/core";
import { Button } from "@/components/ui/button";
import axios from "axios";

interface Response {
  expr: string;
  result: string;
  assign: boolean;
}

interface GeneratedResult {
  expression: string;
  answer: string;
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("rgb(255,255,255)");
  const [result, setResult] = useState<GeneratedResult>();
  const [dictOfVars, setDictOfVars] = useState({});
  const [reset, setReset] = useState(false);

  useEffect(() => {
    if (reset) {
      resetCanvas();
      setReset(false);
    }
  }, [reset]);

  const resetCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.background = "black";
        ctx.lineCap = "round";
        ctx.lineWidth = 3;
        ctx.strokeStyle = color; // Set initial color
        console.log("Canvas initialized:", canvas);
      }
    }
  }, []);

  // Update canvas stroke color when the color state changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = color;
        console.log("Canvas stroke color updated:", color);
      }
    }
  }, [color]);

  const sendData = async () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const response = await axios({
        method: "post",
        url: `${import.meta.env.VITE_API_URL}`,
        data: {
          image: canvas.toDataURL("image/png"),
          dict_of_vars: dictOfVars,
        },
      });
      const resp = await response.data;
      console.log(resp);
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        setIsDrawing(true);
        console.log("Started drawing at:", e.nativeEvent.offsetX, e.nativeEvent.offsetY);
      }
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      console.log("Stopped drawing");
      setIsDrawing(false);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        ctx.stroke();
        console.log("Drawing at:", e.nativeEvent.offsetX, e.nativeEvent.offsetY);
      }
    }
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        <Button
          onClick={() => setReset(true)}
          className="z-20 bg-black text-white"
          variant="default"
          color="black"
        >
          Reset
        </Button>
        <Group className="z-20">
          {SWATCHES.map((swatch: string) => (
            <ColorSwatch
              key={swatch}
              onClick={() => setColor(swatch)}
              color={swatch}
            />
          ))}
        </Group>
        <Button
          onClick={sendData}
          className="z-20 bg-black text-white"
          variant="default"
          color="black"
        >
          Calculate
        </Button>
      </div>
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
    </>
  );
}
