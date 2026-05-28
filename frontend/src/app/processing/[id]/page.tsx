'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { io } from 'socket.io-client';
import axios from 'axios';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

export default function ProcessingPage() {
  const { id } = useParams();
  const router = useRouter();
  const [status, setStatus] = useState<'pending' | 'processing' | 'completed' | 'failed'>('pending');

  useEffect(() => {
    const socket = io('http://localhost:5000');

    // Fetch initial status
    axios.get(`http://localhost:5000/api/assignments/${id}`)
      .then(res => {
        setStatus(res.data.status);
        if (res.data.status === 'completed') {
          router.push(`/result/${id}`);
        }
      });

    socket.emit('join-assignment', id);

    socket.on('assignment-status', (data) => {
      setStatus(data.status);
      if (data.status === 'completed') {
        setTimeout(() => {
          router.push(`/result/${id}`);
        }, 2000);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [id, router]);

  return (
    <main className="center-stage animate-fade">
      <div className="process-card">
        {status === 'pending' || status === 'processing' ? (
          <>
            <div className="process-icon">
              <Loader2 className="spin" size={34} aria-hidden="true" />
            </div>
            <div>
              <h1>Generating your assessment</h1>
              <p>AI is crafting the question paper. This usually takes 30-60 seconds.</p>
            </div>
            <div className="progress-track" aria-hidden="true">
              <div className="progress-bar" />
            </div>
          </>
        ) : status === 'completed' ? (
          <>
            <div className="process-icon">
              <CheckCircle2 size={36} aria-hidden="true" />
            </div>
            <div>
              <h1>Assessment ready</h1>
              <p>Redirecting you to the output page...</p>
            </div>
          </>
        ) : (
          <>
            <div className="process-icon">
              <XCircle size={36} aria-hidden="true" />
            </div>
            <div>
              <h1>Generation failed</h1>
              <p>Something went wrong. Please try again.</p>
              <button 
                className="dark-action process-action"
                onClick={() => router.push('/')}
              >
                Back to Home
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
