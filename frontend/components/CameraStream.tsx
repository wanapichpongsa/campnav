import { useEffect, useRef } from 'react';

export default function CameraStream() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true,
          audio: false 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
      }
    }
    setupCamera();
    
    return () => {
      // Cleanup: stop camera stream when component unmounts
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      className="w-full max-w-[640px] rounded-lg mx-auto"
    />
  );
} 