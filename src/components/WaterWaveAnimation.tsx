// components/WaterWaveAnimation.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface WaterWaveAnimationProps {
  waterPercentage: number;
  isAnimating: boolean;
}

export const WaterWaveAnimation: React.FC<WaterWaveAnimationProps> = ({
  waterPercentage,
  isAnimating
}) => {
  // Configuração das ondas
  const waveConfig = {
    wave1: {
      initial: { x: 0 },
      animate: { 
        x: [0, -30, 0],
        transition: {
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }
    },
    wave2: {
      initial: { x: 0 },
      animate: { 
        x: [0, 20, 0],
        transition: {
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5
        }
      }
    },
    wave3: {
      initial: { x: 0 },
      animate: { 
        x: [0, -15, 0],
        transition: {
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }
      }
    }
  };

  // Animação de bolhas
  const bubbleVariants = {
    hidden: { opacity: 0, y: 0 },
    visible: (i: number) => ({
      opacity: [0, 0.8, 0],
      y: -50,
      transition: {
        duration: 2 + Math.random() * 2,
        repeat: Infinity,
        delay: i * 0.5,
        ease: "easeOut"
      }
    })
  };

  return (
    <div className="relative w-32 h-48 mx-auto mb-6">
      {/* Container da garrafa */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-100 to-blue-50 border-4 border-blue-200 rounded-2xl rounded-b-none shadow-lg overflow-hidden">
        
        {/* Água com ondas */}
        <div 
          className="absolute bottom-0 left-0 right-0 overflow-hidden"
          style={{ height: `${Math.min(waterPercentage, 100)}%` }}
        >
          {/* Camada de água base */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600" />
          
          {/* Ondas animadas */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-r from-blue-300/40 to-cyan-300/30"
            {...waveConfig.wave1}
          />
          <motion.div
            className="absolute bottom-2 left-0 right-0 h-8 bg-gradient-to-r from-blue-200/30 to-cyan-200/20"
            {...waveConfig.wave2}
          />
          <motion.div
            className="absolute bottom-4 left-0 right-0 h-6 bg-gradient-to-r from-blue-100/20 to-cyan-100/10"
            {...waveConfig.wave3}
          />

          {/* Bolhas */}
          {waterPercentage > 0 && (
            <div className="absolute inset-0">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  variants={bubbleVariants}
                  initial="hidden"
                  animate="visible"
                  className="absolute bg-blue-200 rounded-full"
                  style={{
                    width: `${2 + Math.random() * 4}px`,
                    height: `${2 + Math.random() * 4}px`,
                    left: `${10 + Math.random() * 80}%`,
                    bottom: '10%'
                  }}
                />
              ))}
            </div>
          )}

          {/* Efeito de brilho na superfície */}
          <div 
            className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white/20 to-transparent"
            style={{ display: waterPercentage > 0 ? 'block' : 'none' }}
          />
        </div>
        
        {/* Tampinha */}
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-12 h-4 bg-blue-300 rounded-full shadow-md"></div>
        
        {/* Alça */}
        <div className="absolute top-2 -right-2 w-6 h-10 bg-blue-200 rounded-full"></div>
      </div>
      
      {/* Decorações fofas */}
      <div className="absolute -top-2 -left-2 text-2xl animate-float">💧</div>
      <div className="absolute -top-4 -right-2 text-xl animate-float" style={{ animationDelay: '1s' }}>🐠</div>
      <div className="absolute -bottom-2 left-2 text-lg animate-bounce">🌊</div>
    </div>
  );
};