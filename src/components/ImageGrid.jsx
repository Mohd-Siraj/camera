import React from "react";
import { X } from "lucide-react";

const ImageGrid = ({ capturedImages = [], deleteImage = () => {} }) => {
  if (!capturedImages || capturedImages.length === 0) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
        <div className="col-span-full text-center text-gray-500">
          No images available
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
      {capturedImages.map((image, index) => (
        <div key={index} className="relative group aspect-square">
          <div className="relative w-full h-full overflow-hidden rounded-lg">
            <img
              src={image}
              alt={`Captured ${index + 1}`}
              className="w-full h-full object-cover rounded-lg transition-transform duration-200 group-hover:scale-105"
            />
            <button
              onClick={() => deleteImage(index)}
              className="absolute top-2 right-2 p-1 bg-white rounded-full opacity-70 hover:opacity-100 transition-opacity duration-200 shadow-lg hover:bg-gray-100"
              aria-label="Delete image"
            >
              <X className="w-4 h-4 text-gray-700" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ImageGrid;
