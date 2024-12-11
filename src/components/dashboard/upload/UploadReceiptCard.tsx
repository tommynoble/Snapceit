import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Upload } from 'lucide-react';

export function UploadReceiptCard() {
  const handleCameraCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white p-6 shadow-lg"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Receipt</h3>
      
      <div className="space-y-4">
        <button
          onClick={handleCameraCapture}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
        >
          <Camera size={20} />
          Capture Receipt
        </button>

        <div className="relative border-2 border-dashed border-gray-300 p-6 rounded-lg text-center">
          <div className="flex flex-col items-center space-y-2">
            <div className="rounded-full bg-purple-100 p-3">
              <Upload className="h-6 w-6 text-purple-600" />
            </div>
            <p className="text-sm text-gray-600">
              Drag and drop your receipt here, or click to browse
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
