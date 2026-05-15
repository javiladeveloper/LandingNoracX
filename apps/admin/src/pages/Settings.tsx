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

      // Convert AudioBuffer to WAV Blob instantly
      const wavBlob = bufferToWav(renderedBuffer, renderedBuffer.length);

      setStatus('uploading');
      
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;

        const success = await putTeaser(base64Data);
        if (success) {
          setStatus('success');
        } else {
          setStatus('error');
          setErrorMessage("Error guardando el archivo en la base de datos.");
        }
      };
      reader.readAsDataURL(wavBlob);

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

// Utility function to convert AudioBuffer to WAV format
function bufferToWav(abuffer: AudioBuffer, len: number) {
  let numOfChan = abuffer.numberOfChannels,
      length = len * numOfChan * 2 + 44,
      buffer = new ArrayBuffer(length),
      view = new DataView(buffer),
      channels = [], i, sample,
      offset = 0,
      pos = 0;

  setUint32(0x46464952);                         // "RIFF"
  setUint32(length - 8);                         // file length - 8
  setUint32(0x45564157);                         // "WAVE"

  setUint32(0x20746d66);                         // "fmt " chunk
  setUint32(16);                                 // length = 16
  setUint16(1);                                  // PCM (uncompressed)
  setUint16(numOfChan);
  setUint32(abuffer.sampleRate);
  setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
  setUint16(numOfChan * 2);                      // block-align
  setUint16(16);                                 // 16-bit

  setUint32(0x61746164);                         // "data" - chunk
  setUint32(length - pos - 4);                   // chunk length

  for(i = 0; i < abuffer.numberOfChannels; i++)
    channels.push(abuffer.getChannelData(i));

  while(pos < length) {
    for(i = 0; i < numOfChan; i++) {
      sample = Math.max(-1, Math.min(1, channels[i]![offset] as number));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767)|0;
      view.setInt16(pos, sample, true);          // write 16-bit sample
      pos += 2;
    }
    offset++
  }

  function setUint16(data: number) {
    view.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: number) {
    view.setUint32(pos, data, true);
    pos += 4;
  }

  return new Blob([buffer], { type: "audio/wav" });
}


