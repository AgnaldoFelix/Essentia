// // components/AdvancedWaterWaveAnimation.tsx
// import React, { useMemo } from 'react';
// import { motion, Variants } from 'framer-motion';

// interface AdvancedWaterWaveAnimationProps {
//   waterPercentage: number;
//   isAnimating: boolean;
//   width?: number;
//   height?: number;
// }

// export const AdvancedWaterWaveAnimation: React.FC<AdvancedWaterWaveAnimationProps> = ({
//   waterPercentage,
//   isAnimating,
//   width = 160,
//   height = 220
// }) => {
//   const uid = useMemo(() => `wave-clip-${Math.random().toString(36).slice(2, 9)}`, []);

//   const fill = Math.max(0, Math.min(100, waterPercentage)) / 100;
//   const topOffset = 1 - fill;
  
//   // Garante altura mínima visível quando há água
//   const minHeight = waterPercentage > 0 ? Math.max(10, Math.round((height - 16) * fill)) : 0;

//   const continuousWaveVariant: Variants = {
//     animate: {
//       x: [0, -60, 0],
//       transition: {
//         duration: 3,
//         ease: 'linear',
//         repeat: Infinity,
//         repeatType: 'loop'
//       }
//     }
//   };

//   const continuousWaveVariant2: Variants = {
//     animate: {
//       x: [0, 60, 0],
//       transition: {
//         duration: 4,
//         ease: 'linear',
//         repeat: Infinity,
//         repeatType: 'loop'
//       }
//     }
//   };

//   const amplitudeVariant: Variants = {
//     idle: { scaleY: 1 },
//     swell: {
//       scaleY: [1, 1.12, 1.05, 1],
//       transition: {
//         duration: 0.8,
//         ease: [0.4, 0, 0.2, 1]
//       }
//     }
//   };

//   const bubbles = useMemo(() => {
//     return new Array(8).fill(0).map((_, i) => ({
//       left: 10 + (i * 13) + (i % 3) * 3,
//       size: 1.5 + (i % 3) * 0.5,
//       delay: (i % 5) * 0.15,
//       duration: 2.5 + (i % 3) * 0.8
//     }));
//   }, []);

//   // Paths de ondas otimizados - começam do fundo e vão até bem acima
//   const wavePath1 = "M0 20 Q 15 10, 30 20 T 60 20 T 90 20 T 120 20 T 150 20 L 150 200 L 0 200 Z";
//   const wavePath2 = "M0 25 Q 15 15, 30 25 T 60 25 T 90 25 T 120 25 T 150 25 L 150 200 L 0 200 Z";
//   const wavePath3 = "M0 22 Q 15 12, 30 22 T 60 22 T 90 22 T 120 22 T 150 22 L 150 200 L 0 200 Z";

//   return (
//     <div className="relative mx-auto" style={{ width }}>
//       <svg
//         width={width}
//         height={height}
//         viewBox={`0 0 120 ${height}`}
//         preserveAspectRatio="xMidYMid meet"
//         className="block"
//         aria-hidden
//       >
//         <defs>
//           <clipPath id={uid}>
//             <rect x="4" y="8" rx="8" ry="8" width="112" height={height - 16} />
//           </clipPath>

//           <linearGradient id={`${uid}-fill`} x1="0" x2="0" y1="0" y2="1">
//             <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.98" />
//             <stop offset="40%" stopColor="#38bdf8" stopOpacity="0.96" />
//             <stop offset="80%" stopColor="#0ea5e9" stopOpacity="0.94" />
//             <stop offset="100%" stopColor="#0284c7" stopOpacity="0.92" />
//           </linearGradient>

//           <linearGradient id={`${uid}-wave1`} x1="0" x2="1" y1="0" y2="0">
//             <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.6" />
//             <stop offset="50%" stopColor="#bae6fd" stopOpacity="0.5" />
//             <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0.4" />
//           </linearGradient>

//           <linearGradient id={`${uid}-wave2`} x1="0" x2="1" y1="0" y2="0">
//             <stop offset="0%" stopColor="#f0f9ff" stopOpacity="0.4" />
//             <stop offset="50%" stopColor="#e0f2fe" stopOpacity="0.3" />
//             <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.2" />
//           </linearGradient>

//           <linearGradient id={`${uid}-wave3`} x1="0" x2="1" y1="0" y2="0">
//             <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.5" />
//             <stop offset="50%" stopColor="#93c5fd" stopOpacity="0.4" />
//             <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.3" />
//           </linearGradient>

//           <filter id={`${uid}-glow`}>
//             <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
//             <feMerge>
//               <feMergeNode in="coloredBlur"/>
//               <feMergeNode in="SourceGraphic"/>
//             </feMerge>
//           </filter>
//         </defs>

//         <g>
//           <rect
//             x="4"
//             y="8"
//             rx="8"
//             ry="8"
//             width="112"
//             height={height - 16}
//             fill="rgba(255,255,255,0.08)"
//             stroke="rgba(15, 118, 255, 0.15)"
//             strokeWidth="2"
//           />
//           <rect 
//             x="46" 
//             y="2" 
//             width="28" 
//             height="8" 
//             rx="4" 
//             fill="#93c5fd" 
//             stroke="rgba(59, 130, 246, 0.3)" 
//             strokeWidth="1"
//           />
//           <ellipse
//             cx="60"
//             cy="4"
//             rx="10"
//             ry="2"
//             fill="rgba(255,255,255,0.4)"
//           />
//         </g>

//         <g clipPath={`url(#${uid})`}>
//           {/* Fundo da água - visível desde 1% */}
//           {waterPercentage > 0 && (
//             <motion.rect
//               x="4"
//               y={8 + (height - 16) - minHeight}
//               width="112"
//               height={minHeight}
//               fill={`url(#${uid}-fill)`}
//               rx="6"
//               ry="6"
//               initial={false}
//               animate={{ 
//                 y: 8 + (height - 16) - minHeight, 
//                 height: minHeight
//               }}
//               transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
//             />
//           )}

//           {waterPercentage > 0 && (
//             <>
//               {/* Camada de ondas 1 - ajustada para começar do fundo */}
//               <motion.g
//                 style={{ transformOrigin: 'center center' }}
//                 animate="animate"
//                 variants={continuousWaveVariant}
//               >
//                 <motion.path
//                   d={wavePath1}
//                   transform={`translate(-30, ${height - 8})`}
//                   fill={`url(#${uid}-wave1)`}
//                   variants={amplitudeVariant}
//                   initial="idle"
//                   animate={isAnimating ? 'swell' : 'idle'}
//                   style={{ transformBox: 'fill-box', transformOrigin: 'center bottom' }}
//                 />
//               </motion.g>

//               {/* Camada de ondas 2 - ajustada para começar do fundo */}
//               <motion.g
//                 style={{ transformOrigin: 'center center' }}
//                 animate="animate"
//                 variants={continuousWaveVariant2}
//               >
//                 <motion.path
//                   d={wavePath2}
//                   transform={`translate(-30, ${height - 5})`}
//                   fill={`url(#${uid}-wave2)`}
//                   variants={amplitudeVariant}
//                   initial="idle"
//                   animate={isAnimating ? 'swell' : 'idle'}
//                   style={{ transformBox: 'fill-box', transformOrigin: 'center bottom' }}
//                 />
//               </motion.g>

//               {/* Camada de ondas 3 - ajustada para começar do fundo */}
//               <motion.g
//                 style={{ transformOrigin: 'center center' }}
//                 animate={{
//                   x: [0, -45, 0],
//                   transition: {
//                     duration: 3.5,
//                     ease: 'linear',
//                     repeat: Infinity,
//                     repeatType: 'loop'
//                   }
//                 }}
//               >
//                 <motion.path
//                   d={wavePath3}
//                   transform={`translate(-30, ${height - 6})`}
//                   fill={`url(#${uid}-wave3)`}
//                   variants={amplitudeVariant}
//                   initial="idle"
//                   animate={isAnimating ? 'swell' : 'idle'}
//                   style={{ transformBox: 'fill-box', transformOrigin: 'center bottom' }}
//                 />
//               </motion.g>

//               {/* Brilho de superfície - acompanha o topo da água */}
//               <motion.ellipse
//                 cx="60"
//                 cy={8 + (height - 16) - minHeight - 2}
//                 rx="32"
//                 ry="4"
//                 fill="rgba(255,255,255,0.25)"
//                 filter={`url(#${uid}-glow)`}
//                 initial={{ opacity: 0, scaleX: 0.8 }}
//                 animate={{ 
//                   opacity: [0.2, 0.35, 0.2],
//                   scaleX: [0.8, 1, 0.8]
//                 }}
//                 transition={{ 
//                   duration: 2,
//                   repeat: Infinity,
//                   ease: 'easeInOut'
//                 }}
//               />

//               {/* Reflexo adicional - acompanha o topo da água */}
//               <motion.ellipse
//                 cx="60"
//                 cy={8 + (height - 16) - minHeight - 5}
//                 rx="20"
//                 ry="3"
//                 fill="rgba(255,255,255,0.15)"
//                 initial={{ opacity: 0 }}
//                 animate={{ 
//                   opacity: [0.15, 0.25, 0.15]
//                 }}
//                 transition={{ 
//                   duration: 3,
//                   repeat: Infinity,
//                   ease: 'easeInOut',
//                   delay: 0.5
//                 }}
//               />

//               {/* Bolhas - começam do fundo da água */}
//               {bubbles.map((b, i) => {
//                 const waterBottom = 8 + (height - 16);
//                 const waterTop = 8 + (height - 16) - minHeight;
//                 return (
//                   <motion.circle
//                     key={i}
//                     cx={`${b.left}%`}
//                     cy={waterBottom - 15 - (i % 4) * 8}
//                     r={b.size}
//                     fill="#e0f2fe"
//                     stroke="rgba(255,255,255,0.6)"
//                     strokeWidth="0.5"
//                     initial={{ opacity: 0, y: 0, scale: 0.5 }}
//                     animate={{
//                       opacity: [0, 0.8, 0.9, 0],
//                       y: [0, -(waterBottom - waterTop - 10)],
//                       scale: [0.5, 1.2, 0.8, 0.4]
//                     }}
//                     transition={{
//                       duration: b.duration,
//                       delay: b.delay,
//                       repeat: Infinity,
//                       ease: 'easeOut'
//                     }}
//                   />
//                 );
//               })}
//             </>
//           )}
//         </g>

//         <rect
//           x="4"
//           y="8"
//           rx="8"
//           ry="8"
//           width="112"
//           height={height - 16}
//           fill="none"
//           stroke="rgba(2,6,23,0.06)"
//           strokeWidth="1"
//         />

//         <rect
//           x="8"
//           y="12"
//           rx="6"
//           ry="6"
//           width="20"
//           height={height - 24}
//           fill="rgba(255,255,255,0.08)"
//           pointerEvents="none"
//         />
//       </svg>

//       <motion.div 
//         className="absolute -top-2 -left-2 text-2xl pointer-events-none"
//         animate={{
//           y: [0, -8, 0],
//           rotate: [0, 10, 0]
//         }}
//         transition={{
//           duration: 2.5,
//           repeat: Infinity,
//           ease: 'easeInOut'
//         }}
//       >
//         💧
//       </motion.div>
      
//       <motion.div 
//         className="absolute -top-6 -right-2 text-xl pointer-events-none"
//         animate={{
//           y: [0, -6, 0],
//           x: [0, 4, 0],
//           rotate: [0, -15, 0]
//         }}
//         transition={{
//           duration: 3,
//           repeat: Infinity,
//           ease: 'easeInOut',
//           delay: 0.8
//         }}
//       >
//         🐠
//       </motion.div>

//       <motion.div 
//         className="absolute -bottom-2 left-2 text-lg pointer-events-none"
//         animate={{
//           scale: [1, 1.1, 1],
//           opacity: [0.7, 1, 0.7]
//         }}
//         transition={{
//           duration: 2,
//           repeat: Infinity,
//           ease: 'easeInOut'
//         }}
//       >
//         🌊
//       </motion.div>
//     </div>
//   );
// };

// export default AdvancedWaterWaveAnimation;