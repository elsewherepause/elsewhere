"use client";

import { useState, useRef, useEffect } from 'react';

const playlist = [
  {
    title: 'Angel (feat. Horace Andy)',
    artist: 'Massive Attack . Mezzanine',
    src: '/audio/Massive Attack - Angel - MassiveAttackVEVO.mp3'
  },
  {
    title: 'The Spoils ft. Hope Sandoval',
    artist: 'Massive Attack . The Spoils',
    src: '/audio/Massive Attack - The Spoils ft. Hope Sandoval - MassiveAttackVEVO.mp3'
  },
  {
    title: 'Boiler Room NYC Live Set',
    artist: 'DARKSIDE . Boiler Room',
    src: '/audio/DARKSIDE Boiler Room NYC Live Set - ALBEGX.mp3'
  },
  {
    title: 'From Here To Eternity',
    artist: 'Giorgio Moroder',
    src: '/audio/Giorgio Moroder - From Here To Eternity [Remastered] (HD)_128k.mp3'
  },
  {
    title: 'Kashmir (Live O2 Arena)',
    artist: 'Led Zeppelin',
    src: '/audio/Kashmir (Live_ O2 Arena, London - December 10, 2007)_128k.mp3'
  },
];

export default function MusicPlayer({ style }: { style?: React.CSSProperties }) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(() => Math.floor(Math.random() * playlist.length));
  const [isPlaying, setIsPlaying] = useState(false);
  const [mounted, setMounted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    setMounted(true);
    const tryAutoplay = () => {
      if (!audioRef.current) return;
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        const resume = () => {
          audioRef.current?.play().then(() => setIsPlaying(true)).catch(() => {});
          document.removeEventListener('click', resume);
          document.removeEventListener('keydown', resume);
          document.removeEventListener('scroll', resume);
        };
        document.addEventListener('click', resume, { once: true });
        document.addEventListener('keydown', resume, { once: true });
        document.addEventListener('scroll', resume, { once: true });
      });
    };
    tryAutoplay();
  }, []);

  useEffect(() => {
    if (audioRef.current && isPlaying) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => console.error("Audio playback interrupted or failed:", error));
      }
    }
  }, [currentTrackIndex, isPlaying]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      setIsPlaying(true);
      audioRef.current.play().catch(console.error);
    } else {
      setIsPlaying(false);
      audioRef.current.pause();
    }
  };

  const handleEnded = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
  };

  const playPrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentTrackIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
  };

  const playNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
  };

  const currentTrack = playlist[currentTrackIndex];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', ...style }}>
      <audio 
        ref={audioRef} 
        src={currentTrack.src}
        onEnded={handleEnded}
      />

      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 8, 
        alignItems: 'center', 
        width: 183
      }}>
        <div style={{ height: 118, position: 'relative', width: 160 }}>
          
          <div style={{ position: 'absolute', height: 117.958, left: 14.52, top: -0.14, width: 119.266, overflow: 'hidden' }}>
            <img 
              alt="Vinyl" 
              style={{ 
                position: 'absolute', 
                height: '124.3%', 
                left: '-11.12%', 
                maxWidth: 'none', 
                top: '-12.15%', 
                width: '122.94%',
                transition: 'transform 0.5s ease',
              }} 
              className={isPlaying ? "animate-[spin_4s_linear_infinite]" : ""}
              src="/images/vinyl-record.png" 
            />
          </div>

          <div style={{ 
            position: 'absolute', 
            top: 0, 
            left: 14.52, 
            width: 119.266, 
            height: 117.958, 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: '8px',
            zIndex: 10
          }}>
            <button onClick={playPrevious} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.5))' }}>
                <path d="M19 20L9 12L19 4V20Z" />
                <path d="M5 19H7V5H5V19Z" />
              </svg>
            </button>

            <button 
              onClick={togglePlay}
              style={{ 
                width: 44, 
                height: 44, 
                borderRadius: '50%', 
                backgroundColor: '#d32f2f', 
                border: 'none',
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                cursor: 'pointer',
                color: 'white',
                boxShadow: '0px 2px 5px rgba(0,0,0,0.4)'
              }}
            >
              {isPlaying ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: 3 }}>
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>

            <button onClick={playNext} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.5))' }}>
                <path d="M5 4L15 12L5 20V4Z" />
                <path d="M19 5H17V19H19V5Z" />
              </svg>
            </button>
          </div>
        </div>

        <div style={{ fontFamily: 'var(--font-sans), sans-serif', fontSize: 12, color: '#1c1c1c', display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', width: '100%', whiteSpace: 'nowrap', fontWeight: 400, marginTop: 4 }}>
          <p style={{ textTransform: 'uppercase', margin: 0, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {mounted ? currentTrack.title : 'Angel (feat. Horace Andy)'}
          </p>
          <p style={{ margin: 0, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', color: '#666' }}>
            {mounted ? currentTrack.artist : 'Massive Attack . Mezzanine'}
          </p>
        </div>
      </div>
    </div>
  )
}


