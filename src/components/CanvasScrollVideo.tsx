import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Set to a local asset so 4K bandwidth isn't choked by public CDNs blocking connections.
const VIDEO_URL = "/car-video.mp4";

export default function CanvasScrollVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !containerRef.current) return;

    // Forces video to pause so GSAP can strictly hijack its timeline
    video.pause();

    const handleVideoError = () => {
      console.error("Video asset not found. Please place car-video.mp4 in the public directory.");
      setError(true);
    };

    const setupScrub = () => {
      setLoaded(true);
      setError(false);
      
      console.info(
        "🛠️ HARDWARE ACCELERATION NOTE: \n" +
        "Scrubbing raw MP4 <video> tags is fundamentally limited by Keyframe Intervals (GOP) in standard video codecs. " +
        "For a buttery smooth 'Apple-style' 60fps scrub, you must either:\n" +
        "1. Re-encode car-video.mp4 using Intra-frame encoding (All-I) so every frame is a keyframe.\n" +
        "2. Switch back to an Image Sequence <canvas> structure."
      );

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          pin: true,
          scrub: 3, // Significantly heavier 3s smoothing mapped to mitigate missing MP4 keyframes
          start: 'top top',
          end: '+=4000', // Provides 4000px of deep scrolling length
        }
      });

      // Scrub the raw currentTime data point mapping directly to scroll
      tl.fromTo(video, 
        { currentTime: 0 },
        {
          currentTime: video.duration || 10,
          ease: 'none',
        }
      );
    };

    if (video.readyState >= 1) {
      setupScrub();
    } else {
      video.addEventListener('loadedmetadata', setupScrub);
      video.addEventListener('error', handleVideoError);
    }

    return () => {
      video.removeEventListener('loadedmetadata', setupScrub);
      video.removeEventListener('error', handleVideoError);
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      style={{
        height: '100vh',
        width: '100vw',
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* HUD Overlay Interface */}
      <div 
        style={{
          position: 'absolute',
          top: '20%',
          width: '100%',
          textAlign: 'center',
          color: 'white',
          zIndex: 10,
          pointerEvents: 'none',
          mixBlendMode: 'difference',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 1s ease'
        }}
      >
        <h2 style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', fontWeight: 900, letterSpacing: '-0.02em', margin: 0, padding: '0 1rem' }}>
          ENGINEERED<br/>FOR MOTION
        </h2>
        <p style={{ letterSpacing: '0.2em', opacity: 0.8, marginTop: '1rem', textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem' }}>
          Scroll Down to Accelerate
        </p>
      </div>

      {!loaded && !error && (
        <div style={{ position: 'absolute', color: '#00f2ff', fontFamily: 'monospace', letterSpacing: '0.2em', fontSize: '0.8rem', zIndex: 11 }}>
          BUFFERING 4K VIDEO ASSET...
        </div>
      )}

      {error && (
        <div style={{ position: 'absolute', textAlign: 'center', color: '#ff4d00', fontFamily: 'monospace', letterSpacing: '0.1em', fontSize: '0.8rem', zIndex: 11, background: 'rgba(0,0,0,0.8)', padding: '1rem', border: '1px solid #ff4d00', borderRadius: '4px' }}>
          ERROR: Asset not found.<br/><br/>Please place your 4K video file named<br/><b>car-video.mp4</b> directly into your project's <b>/public</b> folder.
        </div>
      )}

      <video 
        ref={videoRef}
        src={VIDEO_URL}
        muted
        playsInline
        preload="auto"
        style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)', 
          minWidth: '100%',
          minHeight: '100%',
          objectFit: 'cover',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 1s ease',
          pointerEvents: 'none'
        }}
      ></video>
      
      {/* Hardware Vignette Overlay */}
      <div style={{
          position: 'absolute', inset: 0, 
          background: 'radial-gradient(circle, transparent 40%, rgba(0,0,0,0.85) 100%)',
          pointerEvents: 'none', zIndex: 5
      }} />
    </div>
  );
}
