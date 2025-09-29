
import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { CameraIcon, RestartIcon } from './icons';

interface PhotoCaptureProps {
  onPhotoTaken: (photo: string | null) => void;
}

const videoConstraints = {
  width: 220,
  height: 220,
  facingMode: 'user',
};

export function PhotoCapture({ onPhotoTaken }: PhotoCaptureProps) {
  const [photo, setPhoto] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);

  const capture = useCallback(() => {
    if (webcamRef.current) {
        const imageSrc = webcamRef.current.getScreenshot();
        setPhoto(imageSrc);
        onPhotoTaken(imageSrc);
    }
  }, [webcamRef, onPhotoTaken]);

  const retake = () => {
    setPhoto(null);
    onPhotoTaken(null);
  };

  return (
    <div className="w-full aspect-square bg-slate-700 rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
      {photo ? (
        <>
          <img src={photo} alt="Candidate snapshot" className="w-full h-full object-cover" />
          <button
            onClick={retake}
            className="absolute bottom-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/80"
          >
            <RestartIcon className="w-5 h-5" />
          </button>
        </>
      ) : (
        <>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            className="w-full h-full object-cover"
          />
          <button
            onClick={capture}
            className="absolute bottom-2 p-3 bg-cyan-600 text-white rounded-full hover:bg-cyan-700"
          >
            <CameraIcon className="w-6 h-6" />
          </button>
        </>
      )}
    </div>
  );
}
