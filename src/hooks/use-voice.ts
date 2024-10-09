import { useEffect, useState, useRef } from "react";

function useVoice({ enabled }: { enabled: boolean }) {
  const [volume, setVolume] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);
  const scriptProcessorRef = useRef(null);

  useEffect(() => {
    let audioContext: any;
    let analyser: any;
    let microphone;
    let scriptProcessor;

    if (enabled) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioContext.createAnalyser();
      analyser.smoothingTimeConstant = 0.8;
      analyser.fftSize = 512;

      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          microphone = audioContext.createMediaStreamSource(stream);
          scriptProcessor = audioContext.createScriptProcessor(512, 1, 1);

          microphone.connect(analyser);
          analyser.connect(scriptProcessor);
          scriptProcessor.connect(audioContext.destination);

          scriptProcessor.onaudioprocess = () => {
            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(dataArray);

            // Calculate average volume and normalize it between 0 and 1
            const avgVolume =
              dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
            const normalizedVolume = avgVolume / 255; // Normalized volume between 0 and 1
            setVolume(normalizedVolume);
            setIsSpeaking(normalizedVolume > 0.1); // Adjust the speaking threshold as needed
          };
        })
        .catch((err) => {
          console.error("Error accessing microphone: ", err);
        });

      // Save references for cleanup
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      microphoneRef.current = microphone;
      scriptProcessorRef.current = scriptProcessor;
    }

    return () => {
      // Cleanup audio context and stream when disabled
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (scriptProcessorRef.current) {
        scriptProcessorRef.current.disconnect();
      }
      if (microphoneRef.current) {
        microphoneRef.current.disconnect();
      }
    };
  }, [enabled]);

  return { volume: parseFloat(volume.toFixed(2)), isSpeaking };
}

export default useVoice;
