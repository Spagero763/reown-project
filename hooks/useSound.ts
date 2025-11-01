import { useState, useEffect, useCallback, useRef } from 'react';
import { sounds } from '../assets/sounds';

type SoundType = keyof typeof sounds;

const useSound = () => {
  const [isMuted, setIsMuted] = useState(() => {
    try {
      const item = window.localStorage.getItem('tacotex_sound_muted');
      return item ? JSON.parse(item) : false;
    } catch (error) {
      console.error("Failed to parse sound mute setting from localStorage", error);
      return false;
    }
  });

  const audioRefs = useRef<Record<SoundType, HTMLAudioElement>>({} as any);

  useEffect(() => {
    // Preload audio and store in a ref
    let loaded = true;
    (Object.keys(sounds) as SoundType[]).forEach(key => {
        if (!audioRefs.current[key]) {
            audioRefs.current[key] = new Audio(sounds[key]);
        }
    });

    return () => {
      // Cleanup audio objects if necessary, though for this app they can persist
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem('tacotex_sound_muted', JSON.stringify(isMuted));
    } catch (error) {
      console.error("Failed to save sound mute setting to localStorage", error);
    }
  }, [isMuted]);

  const playSound = useCallback((sound: SoundType) => {
    if (!isMuted && audioRefs.current[sound]) {
      // Resetting playback time allows the sound to be re-triggered quickly
      audioRefs.current[sound].currentTime = 0;
      audioRefs.current[sound].play().catch(e => {
        // Autoplay can be blocked by the browser, we'll log this error
        console.error(`Sound play failed for '${sound}':`, e);
      });
    }
  }, [isMuted]);

  const toggleSound = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  return { isMuted, toggleSound, playSound };
};

export default useSound;
