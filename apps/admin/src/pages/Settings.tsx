import React, { useState, useRef } from 'react';
import { putTeaser } from '../lib/api';

export default function Settings() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [startSec, setStartSec] = useState<number>(0);
  const [endSec, setEndSec] = useState<number>(30);
  const [status, setStatus] = useState<'idle' | 'processing' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const audioCtxRef = useRef<AudioContext | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAudioFile(e.target.files[0] || null);
    }
  };

  const processAndUpload = async () => {
    if (!audioFile) return;
    setStatus('processing');
    setErrorMessage('');

    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      
      const arrayBuffer = await audioFile.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

      const duration = endSec - startSec;
      if (duration <= 0) throw new Error("El tiempo de fin debe ser mayor al de inicio.");

      // Use OfflineAudioContext to render the slice
      const offlineCtx = new OfflineAudioContext(
        audioBuffer.numberOfChannels,
        ctx.sampleRate * duration,
        ctx.sampleRate
      );

      const source = offlineCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(offlineCtx.destination);
      source.start(0, startSec, duration);

      const renderedBuffer = await offlineCtx.startRendering();

      // Convert AudioBuffer to compressed webm/mp4 using MediaRecorder
      const streamDest = ctx.createMediaStreamDestination();
      const playbackSource = ctx.createBufferSource();
      playbackSource.buffer = renderedBuffer;
      playbackSource.connect(streamDest);

      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/mp4'; // Fallback for Safari
      }

      const recorder = new MediaRecorder(streamDest.stream, { mimeType });
      const chunks: Blob[] = [];

      recorder.ondataavailable = e => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const compressedBlob = new Blob(chunks, { type: mimeType });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Data = reader.result as string;
          const sizeKb = (base64Data.length * 0.75) / 1024;
          
          if (sizeKb > 950) {
            setStatus('error');
            setErrorMessage(`El archivo cortado es demasiado grande (${Math.round(sizeKb)}KB). D1 solo soporta 1MB. Intenta un segmento más corto.`);
            return;
          }

          const success = await putTeaser(base64Data);
          if (success) {
            setStatus('success');
          } else {
            setStatus('error');
            setErrorMessage("Error guardando el archivo en la base de datos.");
          }
        };
        reader.readAsDataURL(compressedBlob);
      };

      setStatus('processing');
      recorder.start();
      playbackSource.start(0);
      
      playbackSource.onended = () => {
        recorder.stop();
        setStatus('uploading');
      };

    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'Error desconocido');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-display uppercase tracking-widest text-bone">Settings</h1>
        <p className="text-ink-dim mt-2 font-mono text-sm">
          Configuraciones del sitio y Teaser Inédito.
        </p>
      </div>

      <div className="bg-coal border border-blood/20 p-6 md:p-8 space-y-6">
        <h2 className="text-xl font-display text-blood-bright uppercase">Cargar Teaser Audio</h2>
        <p className="text-sm text-ink-dim">
          Sube tu archivo WAV/MP3, especifica de qué segundo a qué segundo deseas cortar, y guárdalo. 
          Se limitará a un fragmento corto para optimización.
        </p>

        <div className="space-y-4 font-mono text-sm">
          <div>
            <label className="block text-bone mb-2">Archivo de audio (.wav o .mp3)</label>
            <input 
              type="file" 
              accept="audio/*" 
              onChange={handleFileChange}
              className="bg-black border border-blood/40 text-bone p-3 w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-bone mb-2">Inicio (segundos)</label>
              <input 
                type="number" 
                value={startSec}
                onChange={e => setStartSec(Number(e.target.value))}
                min={0}
                className="bg-black border border-blood/40 text-bone p-3 w-full"
              />
            </div>
            <div>
              <label className="block text-bone mb-2">Fin (segundos)</label>
              <input 
                type="number" 
                value={endSec}
                onChange={e => setEndSec(Number(e.target.value))}
                min={1}
                className="bg-black border border-blood/40 text-bone p-3 w-full"
              />
            </div>
          </div>

          <button 
            onClick={processAndUpload}
            disabled={status === 'processing' || status === 'uploading' || !audioFile}
            className="w-full bg-blood-bright text-bone py-4 uppercase font-bold tracking-widest hover:bg-bone hover:text-blood-bright transition-colors disabled:opacity-50"
          >
            {status === 'processing' ? 'Procesando Audio...' : status === 'uploading' ? 'Subiendo...' : 'Cortar y Publicar'}
          </button>

          {status === 'success' && (
            <div className="p-4 bg-green-900/50 text-green-400 border border-green-500/50">
              ¡Audio publicado exitosamente en la Landing!
            </div>
          )}
          {status === 'error' && (
            <div className="p-4 bg-blood-dim text-bone border border-blood-bright">
              {errorMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


