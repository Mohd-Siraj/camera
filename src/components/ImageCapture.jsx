import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
//   Maximize2,
//   Minimize2,
  RefreshCcw,
  Image as ImageIcon,
  X,
} from "lucide-react";

const ASPECT_RATIOS = {
  SQUARE: { width: 1, height: 1, label: "1:1" },
  PORTRAIT: { width: 3, height: 4, label: "3:4" },
  LANDSCAPE: { width: 4, height: 3, label: "4:3" },
  WIDE: { width: 16, height: 9, label: "16:9" },
};

const ImageCapture = () => {
  const [stream, setStream] = useState(null);
  const [selectedRatio, setSelectedRatio] = useState(ASPECT_RATIOS.SQUARE);
  const [isFrontCamera, setIsFrontCamera] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [capturedImages, setCapturedImages] = useState([]);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // ... all the same functions as before ...

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isFrontCamera]);

  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: isFrontCamera ? "user" : "environment",
          zoom: true,
        },
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(
        constraints
      );
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      // Get supported zoom capabilities
      const track = mediaStream.getVideoTracks()[0];
      const capabilities = track.getCapabilities();
      if (capabilities.zoom) {
        setZoomLevel(capabilities.zoom.min);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const deleteImage = (index) => {
    setCapturedImages((prevImages) => {
      const updatedImages = [...prevImages];
      updatedImages.splice(index, 1);
      return updatedImages;
    });
  };

  const handleZoom = async (newZoom) => {
    if (stream) {
      const track = stream.getVideoTracks()[0];
      const capabilities = await track.getCapabilities();

      // Check if zoom is supported and the new zoom level is within the supported range
      if (capabilities.zoom) {
        const { min, max } = capabilities.zoom;
        if (newZoom >= min && newZoom <= max) {
          await track.applyConstraints({ advanced: [{ zoom: newZoom }] });
          setZoomLevel(newZoom);
        } else {
          console.warn(
            `Zoom level ${newZoom} is out of the supported range (${min} - ${max})`
          );
        }
      } else {
        console.warn("Zoom is not supported on this device");
      }
    }
  };

  const switchCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setIsFrontCamera(!isFrontCamera);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Set canvas dimensions based on selected aspect ratio
      const videoAspect = video.videoWidth / video.videoHeight;
      const targetAspect = selectedRatio.width / selectedRatio.height;

      let drawWidth = video.videoWidth;
      let drawHeight = video.videoHeight;
      let offsetX = 0;
      let offsetY = 0;

      if (videoAspect > targetAspect) {
        drawWidth = drawHeight * targetAspect;
        offsetX = (video.videoWidth - drawWidth) / 2;
      } else {
        drawHeight = drawWidth / targetAspect;
        offsetY = (video.videoHeight - drawHeight) / 2;
      }

      canvas.width = drawWidth;
      canvas.height = drawHeight;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(
        video,
        offsetX,
        offsetY,
        drawWidth,
        drawHeight,
        0,
        0,
        canvas.width,
        canvas.height
      );

      const imageData = canvas.toDataURL("image/jpeg");
      setCapturedImages((prev) => [...prev, imageData]);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 ">
      <div className="bg-white rounded-lg shadow-lg mb-4">
        {" "}
        {/* Replaced Card */}
        <div className="p-4">
          {" "}
          {/* Replaced CardContent */}
          <div className="relative flex justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded-lg"
              style={{
                aspectRatio: `${selectedRatio.width}/${selectedRatio.height}`,
              }}
            />

            {/* Camera controls */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
              <button
                onClick={switchCamera}
                className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
              >
                <RefreshCcw className="w-6 h-6" />
              </button>

              <button
                onClick={captureImage}
                className="p-4 bg-white rounded-full shadow-lg hover:bg-gray-100"
              >
                <Camera className="w-8 h-8" />
              </button>

              <button
                onClick={() => setIsGalleryOpen(!isGalleryOpen)}
                className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
              >
                <ImageIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Zoom controls */}
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <input
                type="range"
                min="1"
                max="5"
                step="0.1"
                value={zoomLevel}
                onChange={(e) => handleZoom(parseFloat(e.target.value))}
                className="w-32 h-1 appearance-none bg-white rounded-lg"
                style={{ writingMode: "bt-lr", transform: "rotate(90deg)" }}
              />
            </div>
          </div>
          {/* Aspect ratio selector */}
          <div className="flex justify-center gap-2 mt-4">
            {Object.entries(ASPECT_RATIOS).map(([key, ratio]) => (
              <button
                key={key}
                onClick={() => setSelectedRatio(ratio)}
                className={`px-3 py-1 rounded ${
                  selectedRatio === ratio
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                {ratio.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Image gallery */}
      {isGalleryOpen && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {capturedImages.map((image, index) => (
            <div key={index} className="relative group cursor-pointer">
              <img
                src={image}
                alt={`Captured ${index + 1}`}
                className="w-full h-full object-cover rounded-lg transition-transform duration-200 group-hover:scale-105"
              />
              <button
                onClick={() => deleteImage(index)}
                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-lg hover:bg-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageCapture;
