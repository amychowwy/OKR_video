import React from 'react';
import {AbsoluteFill} from 'remotion';
export const Cover:React.FC=()=> <AbsoluteFill style={{background:'#F4F7FB'}}>
<svg width="1920" height="1080" viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg">
 <defs><linearGradient id="bg" x1="0" y1="1" x2="1" y2="0"><stop stopColor="#F4F7FB"/><stop offset="1" stopColor="#DFEAFB"/></linearGradient><linearGradient id="accent"><stop stopColor="#087F78"/><stop offset="1" stopColor="#386BE8"/></linearGradient><filter id="shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="18" stdDeviation="24" floodColor="#244C75" floodOpacity=".10"/></filter></defs>
 <rect width="1920" height="1080" fill="url(#bg)"/>
 <circle cx="1750" cy="40" r="410" fill="none" stroke="#C8DAF5" strokeWidth="2"/>
 <circle cx="1750" cy="40" r="330" fill="none" stroke="#D0DEF2" strokeWidth="2"/>
 <g fontFamily="DejaVu Sans, sans-serif">
 <text x="120" y="116" fill="#087F78" fontSize="29" fontWeight="700" letterSpacing="4">OKR <tspan fill="#526781" fontSize="20" fontWeight="400" letterSpacing="3"> / SELF-REVIEW GUIDE</tspan></text>
 <rect x="120" y="236" width="340" height="48" rx="24" fill="#DDEFEA"/><text x="148" y="267" fill="#087F78" fontSize="18" fontWeight="700" letterSpacing="2">QUICK LEARNING GUIDE</text>
 <text x="120" y="400" fill="#132B4D" fontSize="72" fontWeight="700" letterSpacing="-2">How to Complete</text>
 <text x="120" y="510" fill="#132B4D" fontSize="94" fontWeight="700" letterSpacing="-3">Your OKR</text>
 <text x="120" y="625" fill="#087F78" fontSize="94" fontWeight="700" letterSpacing="-3">Self-Review</text>
 <rect x="120" y="685" width="115" height="7" rx="3" fill="url(#accent)"/>
 <text x="120" y="761" fill="#526781" fontSize="30">Assess completion. Choose the right status.</text>
 <g filter="url(#shadow)">
 <rect x="1100" y="282" width="685" height="222" rx="28" fill="white" stroke="#D3E0EF"/>
 <circle cx="1200" cy="393" r="47" fill="#E6F4EF"/><circle cx="1200" cy="393" r="26" fill="none" stroke="#087F78" strokeWidth="4"/><circle cx="1200" cy="393" r="12" fill="none" stroke="#087F78" strokeWidth="4"/>
 <text x="1280" y="378" fill="#132B4D" fontSize="32" fontWeight="700">Completion Rate</text><text x="1280" y="430" fill="#526781" fontSize="23">Record what you achieved</text>
 <rect x="1100" y="548" width="685" height="222" rx="28" fill="white" stroke="#D3E0EF"/>
 <circle cx="1200" cy="659" r="47" fill="#E5EDFF"/><path d="M1179 659l15 15 29-32" stroke="#386BE8" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
 <text x="1280" y="644" fill="#132B4D" fontSize="32" fontWeight="700">KR Status</text><text x="1280" y="696" fill="#526781" fontSize="23">Match progress to the policy</text>
 </g>
 </g>
 <rect x="0" y="1068" width="1920" height="12" fill="url(#accent)"/>
</svg></AbsoluteFill>;
