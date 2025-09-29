
import React, { useRef, useCallback, useState } from 'react';
import Webcam from 'react-webcam';
import { CameraIcon, RefreshIcon } from './icons';

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: "user"
};

interface PhotoCaptureProps {
  onPhotoTaken: (imageSrc: string | null) => void;
  currentPhoto: string | null;
}

const PhotoCapture: React.FC<PhotoCaptureProps> = ({ onPhotoTaken, currentPhoto }) => {
  const webcamRef = useRef<Webcam>(null);

  const capture = useCallback(() => {
    if (webcamRef.current) {
        const imageSrc = webcamRef.current.getScreenshot();
        onPhotoTaken(imageSrc);
    }
  }, [webcamRef, onPhotoTaken]);

  const retake = () => {
    onPhotoTaken(null);
  }

  return (
    <div className="w-full max-w-sm mx-auto">
        <div className="relative aspect-video bg-slate-800 rounded-lg overflow-hidden border-2 border-slate-700">
            {currentPhoto ? (
                <img src={currentPhoto} alt="Candidate snapshot" />
            ) : (
                <Webcam
                    audio={false}
                    height={720}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    width={1280}
                    videoConstraints={videoConstraints}
                    className="w-full h-full object-cover"
                />
            )}
        </div>
        
        <div className="mt-4">
            {currentPhoto ? (
                <button
                    onClick={retake}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-yellow-600/20 text-yellow-300 rounded-md hover:bg-yellow-600/30 transition-colors"
                >
                    <RefreshIcon className="w-5 h-5"/>
                    Retake Photo
                </button>
            ) : (
                <button
                    onClick={capture}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors"
                >
                    <CameraIcon className="w-5 h-5" />
                    Capture Photo
                </button>
            )}
        </div>
    </div>
  );
};

export default PhotoCapture;
