import { useEffect, useRef, useState } from 'react';

/**
 * Reveal component wraps elements and triggers a smooth fade-up + translate-y entrance 
 * when scrolled into view. Automatically respects prefers-reduced-motion.
 */
const Reveal = ({ children, delay = 0, duration = 0.6, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    // Check for prefers-reduced-motion media query
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Once animated in, stop observing
          if (ref.current) {
            observer.unobserve(ref.current);
          }
        }
      },
      {
        threshold: 0.05, // Trigger when 5% of the element is visible
        rootMargin: '0px 0px -50px 0px' // Slightly offset bottom threshold
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  const styles = {
    transitionDelay: `${delay}ms`,
    transitionDuration: `${duration}s`,
  };

  return (
    <div
      ref={ref}
      style={styles}
      className={`${className} transition-all ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
      }`}
    >
      {children}
    </div>
  );
};

export default Reveal;
