import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { CameraIcon, RefreshCwIcon } from './icons';

interface PhotoCaptureProps {
  onPhotoTaken: (dataUrl: string | null) => void;
}

const videoConstraints = {
  width: 500,
  height: 500,
  facingMode: 'user',
};

export const PhotoCapture: React.FC<PhotoCaptureProps> = ({ onPhotoTaken }) => {
  const webcamRef = useRef<Webcam>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [hasWebcam, setHasWebcam] = useState(true);


  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setImgSrc(imageSrc);
      // BUG FIX: Pass the result directly, whether it's a data URL or null.
      // This ensures the parent state is cleared if the screenshot fails.
      onPhotoTaken(imageSrc);
    }
  }, [webcamRef, onPhotoTaken]);

  const retake = () => {
    setImgSrc(null);
    onPhotoTaken(null);
  };

  const handleUserMediaError = () => {
    setHasWebcam(false);
  }

  if (!hasWebcam) {
    return (
        <div className="flex flex-col items-center gap-4 text-center p-4 bg-slate-800 rounded-lg">
             <div className="w-64 h-64 rounded-full overflow-hidden border-4 border-slate-600 flex items-center justify-center bg-slate-700">
                <p className="text-slate-400 text-sm p-4">Webcam not found or access was denied. Please check your browser permissions.</p>
            </div>
            <p className="text-sm text-slate-500">Photo capture is optional.</p>
        </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-64 h-64 rounded-full overflow-hidden border-4 border-slate-600 bg-slate-700">
        {imgSrc ? (
          <img src={imgSrc} alt="Candidate snapshot" className="w-full h-full object-cover" />
        ) : (
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            className="w-full h-full object-cover"
            onUserMediaError={handleUserMediaError}
          />
        )}
      </div>
      <div className="flex gap-4">
        {imgSrc ? (
          <button onClick={retake} className="flex items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
            <RefreshCwIcon className="w-5 h-5" /> Retake
          </button>
        ) : (
          <button onClick={capture} className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
            <CameraIcon className="w-5 h-5" /> Capture Photo
          </button>
        )}
      </div>
    </div>
  );
};
