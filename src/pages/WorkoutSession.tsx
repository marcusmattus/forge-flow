import React, { useRef, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, X, Play, Pause, RotateCcw, Activity } from 'lucide-react';
import { Pose, Results } from '@mediapipe/pose';

export default function WorkoutSession() {
  const { type } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [reps, setReps] = useState(0);
  const [feedback, setFeedback] = useState("Align yourself in the frame");
  const [isPaused, setIsPaused] = useState(false);
  
  // Rep counting state
  const [stage, setStage] = useState<'up' | 'down'>('up');

  useEffect(() => {
    let pose: Pose | null = null;
    let camera: any = null;

    if (isCameraActive && videoRef.current) {
      pose = new Pose({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
        },
      });

      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      pose.onResults(onResults);

      const startCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play();
              requestAnimationFrame(processVideo);
            };
          }
        } catch (err) {
          console.error("Error accessing camera:", err);
          setFeedback("Camera access denied");
        }
      };

      const processVideo = async () => {
        if (videoRef.current && pose && !isPaused) {
          await pose.send({ image: videoRef.current });
          requestAnimationFrame(processVideo);
        } else if (isPaused) {
          requestAnimationFrame(processVideo);
        }
      };

      startCamera();
    }

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      if (pose) pose.close();
    };
  }, [isCameraActive, isPaused]);

  const onResults = (results: Results) => {
    if (!canvasRef.current || !results.poseLandmarks) return;

    const canvasCtx = canvasRef.current.getContext('2d');
    if (!canvasCtx) return;

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    // Draw landmarks (simplified for UI)
    results.poseLandmarks.forEach((landmark) => {
      canvasCtx.beginPath();
      canvasCtx.arc(landmark.x * canvasRef.current!.width, landmark.y * canvasRef.current!.height, 4, 0, 2 * Math.PI);
      canvasCtx.fillStyle = '#FFD700';
      canvasCtx.fill();
    });

    // Rep Counting Logic (Squat Example)
    if (type === 'hiit' || type === 'strength') {
      const hip = results.poseLandmarks[24]; // Right hip
      const knee = results.poseLandmarks[26]; // Right knee
      const ankle = results.poseLandmarks[28]; // Right ankle

      if (hip && knee && ankle) {
        // Calculate angle (simplified)
        const angle = Math.atan2(ankle.y - knee.y, ankle.x - knee.x) - Math.atan2(hip.y - knee.y, hip.x - knee.x);
        const degrees = Math.abs(angle * 180 / Math.PI);

        if (degrees > 160) {
          if (stage === 'down') {
            setReps(prev => prev + 1);
            setFeedback("GOOD REP! GET BACK DOWN!");
          }
          setStage('up');
        }
        if (degrees < 90) {
          setStage('down');
          setFeedback("HOLD IT... NOW PUSH!");
        }
      }
    }

    canvasCtx.restore();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button onClick={() => navigate('/app/dashboard')} className="neo-button bg-white p-2">
          <X size={24} />
        </button>
        <h2 className="text-3xl font-black uppercase italic italic tracking-tighter">
          {type} <span className="text-brand-pink">Session</span>
        </h2>
        <div className="neo-container bg-brand-yellow px-4 py-2 font-black text-2xl italic">
          {reps} REPS
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Camera Feed */}
        <div className="lg:col-span-3 relative neo-container bg-brand-black aspect-video overflow-hidden">
          {!isCameraActive ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8 text-center">
              <Camera size={64} className="mb-4 text-brand-yellow" />
              <h3 className="text-2xl font-black uppercase mb-4">Ready to Forge?</h3>
              <p className="font-bold uppercase tracking-widest text-sm mb-8 opacity-70">
                MediaPipe Pose Landmarker will track your form and reps in real-time.
              </p>
              <button onClick={() => setIsCameraActive(true)} className="neo-button">
                Initialize Camera
              </button>
            </div>
          ) : (
            <>
              <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover opacity-50" playsInline muted />
              <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" width={1280} height={720} />
              
              {/* Overlay UI */}
              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                <div className="neo-container bg-white p-4 max-w-xs">
                  <p className="text-xs font-black uppercase text-gray-400 mb-1">Coach Feedback</p>
                  <p className="font-black uppercase text-lg leading-tight">{feedback}</p>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setIsPaused(!isPaused)} className="neo-button bg-white">
                    {isPaused ? <Play size={24} /> : <Pause size={24} />}
                  </button>
                  <button onClick={() => setReps(0)} className="neo-button bg-white">
                    <RotateCcw size={24} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
          <section className="neo-card bg-brand-pink text-white">
            <h3 className="text-xl font-black uppercase mb-4 flex items-center gap-2">
              <Activity size={20} /> Intensity
            </h3>
            <div className="text-5xl font-black italic mb-2">85%</div>
            <p className="text-xs font-bold uppercase tracking-widest opacity-80">Heart Rate Zone: Anaerobic</p>
          </section>

          <section className="neo-card">
            <h3 className="text-xl font-black uppercase mb-4">Session Goals</h3>
            <ul className="space-y-3 font-bold uppercase text-sm">
              <li className="flex items-center gap-2">
                <div className={clsx("w-4 h-4 border-2 border-brand-black", reps >= 10 && "bg-brand-yellow")} />
                10 Reps Warmup
              </li>
              <li className="flex items-center gap-2">
                <div className={clsx("w-4 h-4 border-2 border-brand-black", reps >= 50 && "bg-brand-yellow")} />
                50 Reps Target
              </li>
              <li className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-brand-black" />
                Perfect Form Bonus
              </li>
            </ul>
          </section>

          <button className="w-full neo-button-pink py-6 text-xl">
            End Session
          </button>
        </div>
      </div>
    </div>
  );
}

import { clsx } from 'clsx';
