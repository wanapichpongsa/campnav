import { useEffect, useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import '@google/model-viewer';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': any;
    }
  }
}

export default function CameraStream() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null); // canvas to create frames

  const captureAndHashFrame = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    // set canvas size to match video
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    // Draw current frame to canvas
    const video = videoRef.current;
    context.drawImage(video, 0, 0)
    // TODO: Insert fuzzy hashing functionality here.
    // Convert to blob data type ()
    const blob = await new Promise<Blob>((resolve) => {
      // toBlob params: blob callback, MIME type, quality
      canvas.toBlob((blob) => {
        if (blob) resolve(blob); // resolve blob promise
      }, 'image/jpeg', 0.7) // 70% quality
    });

    // send to Node multimodal agent multipart form data POST request
    try {
      const formData = new FormData();
      formData.append('frame', blob);

      const response = await fetch('/api/process-frame', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to process frame');
      toast.success('Frame processed successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      toast.error(`Error sending frame: ${errorMessage}`);
    }
  }

  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: {
            facingMode: 'environment', // prefer back camera on phone
            width: { ideal: 1620 },    // iPhone 15 supports 1920x1080
            height: { ideal: 1080 },   // height is width and width is height on mobile for some reason
            frameRate: { ideal: 30 }   // standard frame rate for iPhone 15
          },
          audio: false 
        })
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        toast.error(`Error accessing camera: ${errorMessage}`);
      }
    }
    setupCamera();

    // Interval for frame capture (probably keep even with fuzzy hashing)
    const intervalId = setInterval(captureAndHashFrame, 1000);

    return () => {
      // Cleanup: stop camera stream when component unmounts
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
      clearInterval(intervalId);
    };
  }, []);
  

  return (
    <div className="relative w-full flex justify-center">
      <Toaster />
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full max-w-[640px] rounded-lg z-index-1" />
    </div>
  );
}

declare global {
  interface DeviceOrientationEvent {
    requestPermission?: () => Promise<'granted' | 'denied' | 'default'>;
  }
  interface DeviceOrientationEventStatic {
    requestPermission?: () => Promise<'granted' | 'denied' | 'default'>;
  }
}

function Arrow() {
  const latestHeadingRef = useRef<number | null>(null);
  const baseHeadingRef = useRef<number | null>(null);

  const handleOrientation = (event: DeviceOrientationEvent) => {
    latestHeadingRef.current = -event.alpha!;
    if (baseHeadingRef.current !== null) {
      const relativeAngle = baseHeadingRef.current - latestHeadingRef.current + 180;
      const modelViewer = document.querySelector('model-viewer');
      if (modelViewer) {
        modelViewer.setAttribute('camera-orbit', `${relativeAngle}deg 50deg auto`);
      }
    }
  };
  useEffect(() => {
    return () => {
      // unmount device orientation reference listener
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  const calibrate = () => {
    if (latestHeadingRef.current !== null) {
      baseHeadingRef.current = latestHeadingRef.current;
      // Auto-rotate every 10 seconds
      setInterval(() => {
        baseHeadingRef.current = (baseHeadingRef.current! + 90) % 360;
      }, 10000);
    }
  };

  const enableOrientation = async () => {
    if ('requestPermission' in DeviceOrientationEvent) {
      const permission = await (DeviceOrientationEvent as any).requestPermission(); 
      if (permission === 'granted') {
        window.addEventListener('deviceorientation', handleOrientation);
      }
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center">
      <model-viewer
        src="/arrow.glb" // public directory?
        camera-orbit="0 50deg auto"
        interaction-prompt="none"
        className="absolute z-10 w-[300px] h-[300px] pointer-events-none bg-zinc-900"
      />
      <div className="flex w-full">
        <button
            onClick={calibrate}
            className="absolute top-4 left-4 z-10 bg-black/60 text-white p-2 rounded"
          >
            Calibrate
          </button>
          <button
            onClick={enableOrientation}
            className="absolute top-4 right-4 z-10 bg-black/60 text-white p-2 rounded"
          >
            Enable Orientation
        </button>
      </div>
    </div>
  );
}