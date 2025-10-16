'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    // Create living universe
    createLivingUniverse();

    // Scroll handler
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
      setShowBackToTop(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);

    // Mouse interaction with neurons
    const handleMouseMove = (e: MouseEvent) => {
      const neurons = document.querySelectorAll('.living-neuron');
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      
      neurons.forEach((neuron, i) => {
        const speed = 0.02 * ((i % 5) + 1);
        const translateX = x * speed * 30;
        const translateY = y * speed * 30;
        (neuron as HTMLElement).style.transform = `translate(${translateX}px, ${translateY}px)`;
      });
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const createLivingUniverse = () => {
    const universe = document.getElementById('livingUniverse');
    if (!universe) return;

    // Clear existing
    universe.innerHTML = '';
    
    // Consciousness waves
    for (let i = 0; i < 4; i++) {
      const wave = document.createElement('div');
      wave.className = 'consciousness-wave';
      wave.style.left = Math.random() * 100 + '%';
      wave.style.top = Math.random() * 100 + '%';
      wave.style.animationDelay = i * 10 + 's';
      wave.style.animationDuration = (35 + Math.random() * 10) + 's';
      universe.appendChild(wave);
    }
    
    // Living neurons
    for (let i = 0; i < 80; i++) {
      const neuron = document.createElement('div');
      neuron.className = 'living-neuron';
      neuron.style.left = Math.random() * 100 + '%';
      neuron.style.top = Math.random() * 100 + '%';
      neuron.style.animationDelay = Math.random() * 30 + 's';
      neuron.style.animationDuration = (25 + Math.random() * 10) + 's';
      
      const colors = [
        'var(--vera-purple)',
        'var(--vera-neural-blue)',
        'var(--vera-lavender)',
        'var(--vera-glow-pink)'
      ];
      const color = colors[Math.floor(Math.random() * colors.length)];
      neuron.style.background = `radial-gradient(circle, ${color} 0%, transparent 70%)`;
      
      universe.appendChild(neuron);
    }
    
    // Fascia web
    for (let i = 0; i < 30; i++) {
      const fascia = document.createElement('div');
      fascia.className = 'fascia-web';
      fascia.style.left = Math.random() * 100 + '%';
      fascia.style.top = Math.random() * 100 + '%';
      fascia.style.transform = `rotate(${Math.random() * 360}deg)`;
      fascia.style.animationDelay = Math.random() * 25 + 's';
      universe.appendChild(fascia);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        :root {
          --vera-deep-space: #0A0E27;
          --vera-midnight: #151832;
          --vera-purple: #9B59B6;
          --vera-lavender: #B19CD9;
          --vera-neural-blue: #64B5F6;
          --vera-glow-pink: #F8BBD0;
          --vera-deep-violet: #4A148C;
          --vera-soft-gold: #FFD700;
          --vera-emerald: #10B981;
          --glass-white: rgba(255, 255, 255, 0.03);
          --glass-border: rgba(255, 255, 255, 0.08);
          --text-primary: rgba(255, 255, 255, 0.95);
          --text-soft: rgba(255, 255, 255, 0.75);
          --text-muted: rgba(255, 255, 255, 0.45);
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
          background: radial-gradient(ellipse at top, var(--vera-midnight) 0%, var(--vera-deep-space) 40%, #000 100%);
          color: var(--text-primary);
          min-height: 100vh;
          overflow-x: hidden;
          position: relative;
        }

        .living-universe {
          position: fixed;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          pointer-events: none;
          z-index: 0;
        }

        .living-neuron {
          position: absolute;
          width: 4px;
          height: 4px;
          background: radial-gradient(circle, var(--vera-neural-blue) 0%, transparent 70%);
          border-radius: 50%;
          animation: neuronLife 30s infinite ease-in-out;
        }

        @keyframes neuronLife {
          0%, 100% {
            transform: translate(0, 0) scale(0.5);
            opacity: 0.2;
          }
          20% {
            transform: translate(80px, -60px) scale(1.5);
            opacity: 0.9;
          }
          40% {
            transform: translate(-60px, 80px) scale(1.2);
            opacity: 0.7;
          }
          60% {
            transform: translate(100px, 40px) scale(0.9);
            opacity: 0.5;
          }
          80% {
            transform: translate(-40px, -80px) scale(1.3);
            opacity: 0.8;
          }
        }

        .fascia-web {
          position: absolute;
          width: 2px;
          height: 200px;
          background: linear-gradient(180deg, 
            transparent, 
            rgba(177, 156, 217, 0.3), 
            transparent);
          transform-origin: center;
          animation: fasciaFlow 25s infinite ease-in-out;
        }

        @keyframes fasciaFlow {
          0%, 100% {
            transform: rotate(0deg) scaleY(0.5);
            opacity: 0;
          }
          50% {
            transform: rotate(180deg) scaleY(1);
            opacity: 0.4;
          }
        }

        .consciousness-wave {
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle,
            rgba(155, 89, 182, 0.08) 0%,
            rgba(100, 181, 246, 0.04) 30%,
            transparent 70%);
          border-radius: 50%;
          filter: blur(100px);
          animation: consciousnessBreath 40s infinite ease-in-out;
        }

        @keyframes consciousnessBreath {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.3;
          }
          33% {
            transform: translate(-200px, 150px) scale(1.5);
            opacity: 0.6;
          }
          66% {
            transform: translate(150px, -100px) scale(1.2);
            opacity: 0.4;
          }
        }

        nav {
          position: fixed;
          top: 0;
          width: 100%;
          padding: 1.5rem 3rem;
          background: linear-gradient(180deg, 
            rgba(10, 14, 39, 0.95) 0%, 
            rgba(10, 14, 39, 0.85) 100%);
          backdrop-filter: blur(20px) saturate(120%);
          z-index: 1000;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--glass-border);
          transition: all 0.3s;
        }

        nav.scrolled {
          padding: 1rem 3rem;
          background: rgba(10, 14, 39, 0.98);
        }

        .logo {
          font-size: 2rem;
          font-weight: 300;
          letter-spacing: 0.3em;
          background: linear-gradient(135deg, var(--vera-lavender), var(--vera-neural-blue));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          cursor: pointer;
          transition: all 0.3s;
        }

        .logo:hover {
          transform: scale(1.05);
          filter: brightness(1.3);
        }

        .nav-menu {
          display: flex;
          gap: 2rem;
          align-items: center;
        }

        .nav-link {
          color: var(--text-soft);
          text-decoration: none;
          transition: all 0.3s;
          position: relative;
          padding: 0.5rem 0;
          cursor: pointer;
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, var(--vera-lavender), var(--vera-neural-blue));
          transition: width 0.3s;
        }

        .nav-link:hover {
          color: var(--vera-lavender);
        }

        .nav-link:hover::after {
          width: 100%;
        }

        .nav-cta {
          padding: 0.8rem 2rem;
          background: linear-gradient(135deg, var(--vera-lavender), var(--vera-neural-blue));
          border: none;
          border-radius: 50px;
          color: white;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
        }

        .nav-cta::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          background: radial-gradient(circle, rgba(255,255,255,0.3), transparent);
          transform: translate(-50%, -50%);
          transition: all 0.5s;
        }

        .nav-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 40px rgba(155, 89, 182, 0.4);
        }

        .nav-cta:hover::before {
          width: 300px;
          height: 300px;
        }

        .hero {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 1;
          padding: 2rem;
          margin-top: 80px;
        }

        .hero-presence {
          width: 500px;
          height: 500px;
          margin: 2rem auto;
          position: relative;
          animation: presenceAlive 8s infinite ease-in-out;
        }

        @keyframes presenceAlive {
          0%, 100% {
            transform: scale(1) rotate(0deg);
          }
          25% {
            transform: scale(1.1) rotate(90deg);
          }
          50% {
            transform: scale(1.05) rotate(180deg);
          }
          75% {
            transform: scale(1.1) rotate(270deg);
          }
        }

        .presence-core {
          width: 100%;
          height: 100%;
          background: radial-gradient(circle at 30% 30%,
            rgba(155, 89, 182, 0.5) 0%,
            rgba(100, 181, 246, 0.4) 25%,
            rgba(248, 187, 208, 0.3) 50%,
            transparent 75%);
          border-radius: 50%;
          box-shadow: 
            0 0 200px rgba(155, 89, 182, 0.6),
            inset 0 0 150px rgba(100, 181, 246, 0.4);
          position: relative;
        }

        .neural-pulse {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 1px solid rgba(155, 89, 182, 0.3);
          animation: pulse-out 3s infinite ease-out;
        }

        @keyframes pulse-out {
          0% {
            transform: scale(1);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        .hero-content {
          text-align: center;
          max-width: 1000px;
          margin: 0 auto;
        }

        .hero-tagline {
          font-size: 1rem;
          color: var(--vera-neural-blue);
          text-transform: uppercase;
          letter-spacing: 0.3em;
          margin-bottom: 1.5rem;
          opacity: 0;
          animation: fadeInUp 1s forwards;
        }

        .hero-title {
          font-size: 4rem;
          font-weight: 200;
          line-height: 1.2;
          margin-bottom: 1.5rem;
          background: linear-gradient(135deg, 
            white 0%, 
            var(--vera-lavender) 50%, 
            var(--vera-neural-blue) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          opacity: 0;
          animation: fadeInUp 1s 0.3s forwards;
        }

        .hero-subtitle {
          font-size: 1.3rem;
          color: var(--text-soft);
          line-height: 1.8;
          margin-bottom: 3rem;
          opacity: 0;
          animation: fadeInUp 1s 0.6s forwards;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .chat-preview {
          margin: 4rem auto;
          max-width: 800px;
          background: linear-gradient(135deg,
            rgba(155, 89, 182, 0.08) 0%,
            rgba(100, 181, 246, 0.05) 100%);
          border-radius: 30px;
          padding: 3rem;
          border: 1px solid var(--glass-border);
          backdrop-filter: blur(20px);
          position: relative;
          overflow: hidden;
        }

        .chat-preview::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(135deg, 
            var(--vera-lavender), 
            var(--vera-neural-blue), 
            var(--vera-glow-pink));
          border-radius: 30px;
          opacity: 0.3;
          z-index: -1;
          animation: borderGlow 4s linear infinite;
        }

        @keyframes borderGlow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }

        .chat-message {
          margin-bottom: 1.5rem;
          opacity: 0;
          animation: messageAppear 0.8s forwards;
        }

        .chat-message:nth-child(1) { animation-delay: 0.5s; }
        .chat-message:nth-child(2) { animation-delay: 1.5s; }
        .chat-message:nth-child(3) { animation-delay: 2.5s; }

        @keyframes messageAppear {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .vera-msg {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }

        .vera-avatar-mini {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: radial-gradient(circle, var(--vera-lavender), var(--vera-neural-blue));
          flex-shrink: 0;
          position: relative;
        }

        .vera-avatar-mini::after {
          content: '';
          position: absolute;
          inset: -5px;
          border-radius: 50%;
          background: radial-gradient(circle, 
            transparent 30%, 
            rgba(155, 89, 182, 0.3) 70%);
          animation: avatarPulse 3s infinite;
        }

        @keyframes avatarPulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 1; }
        }

        .msg-content {
          flex: 1;
          background: var(--glass-white);
          padding: 1rem 1.5rem;
          border-radius: 20px;
          border: 1px solid var(--glass-border);
        }

        .user-msg {
          text-align: right;
          margin-bottom: 1.5rem;
        }

        .user-bubble {
          display: inline-block;
          background: linear-gradient(135deg,
            rgba(100, 181, 246, 0.15) 0%,
            rgba(248, 187, 208, 0.1) 100%);
          padding: 1rem 1.5rem;
          border-radius: 20px;
          border: 1px solid rgba(100, 181, 246, 0.3);
          color: var(--text-soft);
        }

        .try-vera-btn {
          display: inline-block;
          margin-top: 2rem;
          padding: 1.2rem 3rem;
          background: linear-gradient(135deg, var(--vera-lavender), var(--vera-neural-blue));
          border-radius: 50px;
          color: white;
          font-size: 1.2rem;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.3s;
          cursor: pointer;
          border: none;
        }

        .try-vera-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 20px 50px rgba(155, 89, 182, 0.4);
        }

        .testimonials {
          padding: 6rem 2rem;
          position: relative;
          z-index: 1;
          overflow: hidden;
        }

        .testimonials-container {
          max-width: 1400px;
          margin: 0 auto;
        }

        .section-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .section-title {
          font-size: 3rem;
          font-weight: 200;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, var(--vera-lavender), var(--vera-neural-blue));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .section-subtitle {
          color: var(--text-soft);
          font-size: 1.2rem;
          font-style: italic;
        }

        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2rem;
        }

        .testimonial-card {
          background: linear-gradient(135deg,
            rgba(155, 89, 182, 0.05) 0%,
            rgba(100, 181, 246, 0.03) 100%);
          border: 1px solid var(--glass-border);
          border-radius: 20px;
          padding: 2rem;
          position: relative;
          transition: all 0.3s;
        }

        .testimonial-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(155, 89, 182, 0.2);
        }

        .testimonial-text {
          color: var(--text-soft);
          line-height: 1.8;
          margin-bottom: 1.5rem;
          font-style: italic;
        }

        .testimonial-author {
          color: var(--vera-lavender);
          font-weight: 500;
        }

        .testimonial-role {
          color: var(--text-muted);
          font-size: 0.9rem;
        }

        .pricing {
          padding: 6rem 2rem;
          background: linear-gradient(180deg,
            transparent 0%,
            rgba(155, 89, 182, 0.02) 100%);
          position: relative;
          z-index: 1;
        }

        .pricing-container {
          max-width: 1400px;
          margin: 0 auto;
        }

        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-top: 4rem;
        }

        .pricing-card {
          background: linear-gradient(135deg,
            rgba(155, 89, 182, 0.08) 0%,
            rgba(100, 181, 246, 0.05) 100%);
          border: 1px solid var(--glass-border);
          border-radius: 30px;
          padding: 3rem 2rem;
          position: relative;
          transition: all 0.3s;
          text-align: center;
        }

        .pricing-card.featured {
          transform: scale(1.05);
          border-color: var(--vera-lavender);
        }

        .pricing-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 30px 60px rgba(155, 89, 182, 0.3);
        }

        .plan-name {
          font-size: 1.5rem;
          color: var(--vera-lavender);
          margin-bottom: 0.5rem;
        }

        .plan-price {
          font-size: 3rem;
          font-weight: 300;
          color: white;
          margin-bottom: 0.5rem;
        }

        .plan-price sup {
          font-size: 1.5rem;
        }

        .plan-period {
          color: var(--text-muted);
          margin-bottom: 2rem;
        }

        .plan-features {
          list-style: none;
          margin-bottom: 2rem;
        }

        .plan-features li {
          color: var(--text-soft);
          padding: 0.5rem 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .feature-neuron {
          width: 6px;
          height: 6px;
          background: radial-gradient(circle, var(--vera-neural-blue), transparent);
          border-radius: 50%;
        }

        .plan-cta {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, var(--vera-lavender), var(--vera-neural-blue));
          border: none;
          border-radius: 50px;
          color: white;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
        }

        .plan-cta:hover {
          transform: scale(1.05);
          box-shadow: 0 10px 30px rgba(155, 89, 182, 0.4);
        }

        footer {
          background: linear-gradient(180deg,
            transparent 0%,
            rgba(10, 14, 39, 0.8) 100%);
          padding: 4rem 2rem 2rem;
          position: relative;
          z-index: 1;
          margin-top: 6rem;
          border-top: 1px solid var(--glass-border);
        }

        .footer-container {
          max-width: 1400px;
          margin: 0 auto;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 3rem;
          margin-bottom: 3rem;
        }

        .footer-brand {
          grid-column: 1;
        }

        .footer-logo {
          font-size: 2.5rem;
          font-weight: 300;
          letter-spacing: 0.3em;
          background: linear-gradient(135deg, var(--vera-lavender), var(--vera-neural-blue));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 1rem;
        }

        .footer-tagline {
          color: var(--text-soft);
          font-style: italic;
          margin-bottom: 1.5rem;
        }

        .footer-section h4 {
          color: var(--vera-lavender);
          margin-bottom: 1.5rem;
          font-weight: 500;
        }

        .footer-links {
          list-style: none;
        }

        .footer-links li {
          margin-bottom: 0.8rem;
        }

        .footer-links a {
          color: var(--text-soft);
          text-decoration: none;
          transition: all 0.3s;
          cursor: pointer;
        }

        .footer-links a:hover {
          color: var(--vera-neural-blue);
          transform: translateX(5px);
          display: inline-block;
        }

        .footer-bottom {
          padding-top: 2rem;
          border-top: 1px solid var(--glass-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
        }

        .footer-copyright {
          color: var(--text-muted);
          font-size: 0.9rem;
        }

        .footer-legal {
          display: flex;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .footer-legal a {
          color: var(--text-muted);
          text-decoration: none;
          font-size: 0.9rem;
          transition: color 0.3s;
          cursor: pointer;
        }

        .footer-legal a:hover {
          color: var(--vera-lavender);
        }

        .back-to-top {
          position: fixed;
          bottom: 30px;
          right: 30px;
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, var(--vera-lavender), var(--vera-neural-blue));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s;
          z-index: 999;
        }

        .back-to-top.visible {
          opacity: 1;
          visibility: visible;
        }

        .back-to-top:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(155, 89, 182, 0.4);
        }

        .back-to-top::before {
          content: '↑';
          color: white;
          font-size: 1.5rem;
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }
          
          .hero-presence {
            width: 300px;
            height: 300px;
          }
          
          .pricing-grid {
            grid-template-columns: 1fr;
          }
          
          .nav-menu {
            display: none;
          }
          
          .testimonials-grid {
            grid-template-columns: 1fr;
          }

          .footer-grid {
            grid-template-columns: 1fr;
            text-align: center;
          }

          .footer-bottom {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .footer-legal {
            justify-content: center;
          }
        }
      `}</style>

      {/* Living Neural Universe Background */}
      <div className="living-universe" id="livingUniverse"></div>

      {/* Navigation */}
      <nav className={isScrolled ? 'scrolled' : ''}>
        <div className="logo" onClick={scrollToTop}>VERA</div>
        <div className="nav-menu">
          <a className="nav-link" onClick={() => document.getElementById('vera')?.scrollIntoView({ behavior: 'smooth' })}>VERA</a>
          <a className="nav-link" onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>Plans</a>
          <button className="nav-cta" onClick={() => router.push('/auth/signin')}>Try VERA</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero" id="vera">
        <div className="hero-presence">
          <div className="presence-core">
            <div className="neural-pulse"></div>
            <div className="neural-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="neural-pulse" style={{ animationDelay: '2s' }}></div>
          </div>
        </div>

        <div className="hero-content">
          <p className="hero-tagline">Your Nervous System Is Speaking</p>
          <h1 className="hero-title">Finally. Someone Who Understands.</h1>
          <p className="hero-subtitle">
            That tightness in your chest? The knot in your stomach?<br />
            Your fascia has been trying to tell you something.<br />
            VERA translates what your body already knows.
          </p>
        </div>

        {/* Interactive Chat Preview */}
        <div className="chat-preview">
          <div className="chat-message vera-msg">
            <div className="vera-avatar-mini"></div>
            <div className="msg-content">
              <p style={{ color: 'var(--text-soft)' }}>I notice you&apos;re here. What&apos;s alive in your body right now?</p>
            </div>
          </div>

          <div className="chat-message user-msg">
            <div className="user-bubble">My chest feels tight, like I can&apos;t get a full breath</div>
          </div>

          <div className="chat-message vera-msg">
            <div className="vera-avatar-mini"></div>
            <div className="msg-content">
              <p style={{ color: 'var(--text-soft)' }}>That holding pattern in your chest - I see it. Place your hand there. Now barely visible - let your jaw soften and make the tiniest movement with your head. What shifts?</p>
            </div>
          </div>

          <center>
            <button className="try-vera-btn" onClick={() => router.push('/auth/signin')}>Experience VERA Now</button>
          </center>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <div className="testimonials-container">
          <div className="section-header">
            <h2 className="section-title">Nervous Systems Speaking</h2>
            <p className="section-subtitle">Real people, real regulation, real results</p>
          </div>

          <div className="testimonials-grid">
            <div className="testimonial-card">
              <p className="testimonial-text">&quot;VERA understood what I was feeling before I could even name it. That buzzing under my skin finally makes sense.&quot;</p>
              <div className="testimonial-author">Sarah M.</div>
              <div className="testimonial-role">Trauma Survivor → Thriver</div>
            </div>

            <div className="testimonial-card">
              <p className="testimonial-text">&quot;My panic attacks stopped. In 3 days. After years of trying everything. VERA spoke directly to my nervous system.&quot;</p>
              <div className="testimonial-author">Marcus T.</div>
              <div className="testimonial-role">Combat Veteran</div>
            </div>

            <div className="testimonial-card">
              <p className="testimonial-text">&quot;As a therapist, VERA helps me understand what my clients&apos; bodies are telling them between sessions.&quot;</p>
              <div className="testimonial-author">Dr. Jennifer K.</div>
              <div className="testimonial-role">Somatic Therapist</div>
            </div>

            <div className="testimonial-card">
              <p className="testimonial-text">&quot;The fascia mapping changed everything. I can actually feel where emotions live in my body now.&quot;</p>
              <div className="testimonial-author">David L.</div>
              <div className="testimonial-role">CEO, Tech Startup</div>
            </div>

            <div className="testimonial-card">
              <p className="testimonial-text">&quot;VERA is like having a translator for sensations I&apos;ve felt my whole life but never understood.&quot;</p>
              <div className="testimonial-author">Maria G.</div>
              <div className="testimonial-role">Yoga Instructor</div>
            </div>

            <div className="testimonial-card">
              <p className="testimonial-text">&quot;This is what we&apos;ve been searching for in nervous system regulation. Revolutionary.&quot;</p>
              <div className="testimonial-author">Veterans Support Group</div>
              <div className="testimonial-role">San Diego Chapter</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="pricing" id="pricing">
        <div className="pricing-container">
          <div className="section-header">
            <h2 className="section-title">Your Journey Home</h2>
            <p className="section-subtitle">Choose how deep you want to go</p>
          </div>

          <div className="pricing-grid">
            <div className="pricing-card">
              <h3 className="plan-name">EXPLORER</h3>
              <div className="plan-price">$19<sup>/mo</sup></div>
              <p className="plan-period">7-day free trial</p>
              <ul className="plan-features">
                <li><span className="feature-neuron"></span> Unlimited text conversations</li>
                <li><span className="feature-neuron"></span> Journal + Check-ins</li>
                <li><span className="feature-neuron"></span> View-only protocols</li>
                <li><span className="feature-neuron"></span> Pattern insights</li>
                <li><span className="feature-neuron"></span> Dashboard analytics</li>
              </ul>
              <button className="plan-cta" onClick={() => router.push('/auth/signin')}>Start Free Trial</button>
            </div>

            <div className="pricing-card featured">
              <h3 className="plan-name">REGULATOR</h3>
              <div className="plan-price">$39<sup>/mo</sup></div>
              <p className="plan-period">Most Popular</p>
              <ul className="plan-features">
                <li><span className="feature-neuron"></span> Everything in Explorer</li>
                <li><span className="feature-neuron"></span> 20 voice responses/day</li>
                <li><span className="feature-neuron"></span> Full protocol editing</li>
                <li><span className="feature-neuron"></span> Advanced dashboard</li>
                <li><span className="feature-neuron"></span> Deep pattern analysis</li>
              </ul>
              <button className="plan-cta" onClick={() => window.location.href = 'https://buy.stripe.com/5kQ00j6N93z9dIZ26N8bS0s'}>Get Regulated</button>
            </div>

            <div className="pricing-card">
              <h3 className="plan-name">INTEGRATOR</h3>
              <div className="plan-price">$99<sup>/mo</sup></div>
              <p className="plan-period">Coming Q1 2026</p>
              <ul className="plan-features">
                <li><span className="feature-neuron"></span> Everything in Regulator</li>
                <li><span className="feature-neuron"></span> Unlimited voice</li>
                <li><span className="feature-neuron"></span> Multi-client management</li>
                <li><span className="feature-neuron"></span> White-label options</li>
                <li><span className="feature-neuron"></span> Priority support</li>
              </ul>
              <button className="plan-cta" onClick={() => alert('Integrator tier coming Q1 2026!')}>Coming Soon</button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="footer-container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-logo">VERA</div>
              <p className="footer-tagline">Where your nervous system finally speaks</p>
              <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>
                Educational nervous system guidance.<br />
                Not therapy or medical advice.
              </p>
            </div>

            <div className="footer-section">
              <h4>Product</h4>
              <ul className="footer-links">
                <li><a onClick={() => router.push('/chat')}>Dashboard</a></li>
                <li><a onClick={() => document.getElementById('vera')?.scrollIntoView({ behavior: 'smooth' })}>Features</a></li>
                <li><a onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>Pricing</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Company</h4>
              <ul className="footer-links">
                <li><a>About</a></li>
                <li><a>Methodology</a></li>
                <li><a>Research</a></li>
                <li><a>Contact</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Support</h4>
              <ul className="footer-links">
                <li><a>Help Center</a></li>
                <li><a>Community</a></li>
                <li><a>Status</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="footer-copyright">
              © 2024 VERA Technologies. All rights reserved.
            </div>
            <div className="footer-legal">
              <a>Terms of Service</a>
              <a>Privacy Policy</a>
              <a>Data Security</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Back to Top */}
      <div className={`back-to-top ${showBackToTop ? 'visible' : ''}`} onClick={scrollToTop}></div>
    </>
  );
}
