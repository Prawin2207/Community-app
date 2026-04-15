<template>
  <div class="procure-nexus-app relative w-screen h-screen overflow-hidden bg-[#06070D] font-mono text-cyan-400">
    <!-- Grid Canvas Background -->
    <div class="absolute inset-0 spatial-grid opacity-20 pointer-events-none"></div>

    <!-- Tactical Overlay: Top Left -->
    <div class="absolute top-6 left-6 z-50 flex flex-col gap-2 pointer-events-none">
      <div class="bg-[rgba(16,22,34,0.6)] backdrop-blur-md border border-[rgba(0,240,255,0.2)] p-4 shadow-[0_0_15px_rgba(0,240,255,0.1)]">
        <h2 class="text-[#00F0FF] font-['Rajdhani'] uppercase tracking-widest text-sm font-bold mb-1">Operative Status</h2>
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-[#00F0FF] shadow-[0_0_8px_#00F0FF] animate-pulse"></div>
          <span class="text-[#E0F7FA] text-xs">UPLINK SECURE</span>
        </div>
        <div class="mt-3 text-xs text-[#4A7C82]">SYS.TEMP <span class="text-[#E0F7FA] float-right ml-4">42°C</span></div>
        <div class="mt-1 text-xs text-[#4A7C82]">NET.LATENCY <span class="text-[#E0F7FA] float-right ml-4">12ms</span></div>
      </div>
    </div>

    <!-- Tactical Overlay: Top Right (Mini Radar) -->
    <div class="absolute top-6 right-6 z-50 pointer-events-none">
      <div class="w-32 h-32 rounded-full border border-[rgba(0,240,255,0.3)] bg-[rgba(16,22,34,0.8)] backdrop-blur-md flex items-center justify-center relative overflow-hidden">
        <div class="absolute inset-0 radar-sweep"></div>
        <div class="w-1 h-1 bg-[#FFB800] rounded-full absolute top-8 left-10 animate-ping"></div>
        <div class="w-1 h-1 bg-[#00F0FF] rounded-full absolute bottom-10 right-14 animate-ping" style="animation-delay: 1s"></div>
        <div class="w-1 h-1 bg-[#FF2A2A] rounded-full absolute top-12 right-8 animate-ping" style="animation-delay: 0.5s"></div>
        <div class="text-[0.6rem] text-[#4A7C82] font-['Rajdhani'] tracking-widest relative z-10 text-center leading-tight">GLOBAL<br>RADAR</div>
      </div>
    </div>

    <!-- 3D Spatial Canvas for Nodes -->
    <div 
      class="absolute inset-0 flex items-center justify-center transition-all duration-1000"
      :class="{'scale-[5] opacity-0 blur-md pointer-events-none': activeModule}"
    >
      <!-- The Nexus Core -->
      <div class="relative w-48 h-48 flex items-center justify-center group cursor-pointer z-10 animate-spin-slow">
        <div class="absolute inset-0 border-2 border-[rgba(0,240,255,0.4)] rounded-full border-t-transparent shadow-[0_0_30px_rgba(0,240,255,0.2)]"></div>
        <div class="absolute inset-2 border border-[#FFB800]/30 rounded-full border-b-transparent animate-spin-reverse-slow"></div>
        <div class="absolute inset-6 border border-[#00F0FF]/20 rounded-full border-l-transparent animate-spin-slow"></div>
        
        <!-- Core Text (Doesn't spin) -->
        <div class="absolute inset-0 flex items-center justify-center flex-col animate-spin-reverse-slow group-hover:scale-110 transition-transform duration-500">
           <span class="text-[#00F0FF] font-['Rajdhani'] text-xl font-bold tracking-widest drop-shadow-[0_0_8px_#00F0FF]">NEXUS</span>
           <span class="text-[0.6rem] text-[#4A7C82] tracking-widest uppercase mt-1 text-center leading-tight">Core Engine</span>
        </div>
      </div>

      <!-- Orbital Nodes -->
      <div 
        v-for="(mod, index) in modules" 
        :key="mod.id"
        class="absolute"
        :style="getOrbitStyle(index, modules.length)"
      >
        <button 
          @click="openModule(mod)"
          class="relative w-28 h-28 rounded-full border border-[rgba(0,240,255,0.3)] bg-[rgba(16,22,34,0.8)] backdrop-blur-md flex flex-col items-center justify-center transition-all duration-300 hover:border-[#00F0FF] hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:scale-110 hover:z-30 group z-20"
        >
          <div class="text-[#E0F7FA] font-['Rajdhani'] text-[0.65rem] font-bold tracking-widest mb-1 group-hover:text-[#00F0FF] text-center w-full px-2 leading-tight">{{ mod.name }}</div>
          <div class="text-[0.55rem] text-[#4A7C82] uppercase">{{ mod.status }}</div>
          <div v-if="mod.alert" class="absolute -top-1 -right-1 w-3 h-3 bg-[#FFB800] rounded-full animate-bounce shadow-[0_0_8px_#FFB800]"></div>
        </button>
      </div>
      
      <!-- Orbit tracks -->
      <div class="absolute w-[600px] h-[600px] rounded-full border border-dashed border-[#4A7C82]/20 pointer-events-none"></div>
    </div>

    <!-- Active Module Glass Panel -->
    <transition name="warp-speed">
      <div v-if="activeModule" class="absolute inset-0 z-40 p-10 flex flex-col pointer-events-none">
        <!-- Header -->
        <div class="flex items-center justify-between mb-8 pointer-events-auto">
          <div>
            <h1 class="text-4xl text-[#00F0FF] font-['Rajdhani'] tracking-[0.2em] font-light shadow-glow">{{ activeModule.name.toUpperCase() }}</h1>
            <p class="text-[#4A7C82] text-sm tracking-widest mt-1 uppercase">Establishing direct uplink...</p>
          </div>
          <button @click="closeModule" class="px-6 py-2 border border-[#FF2A2A]/50 bg-[#FF2A2A]/10 text-[#FF2A2A] hover:bg-[#FF2A2A] hover:text-[#06070D] transition-colors font-bold tracking-widest text-sm flex items-center gap-2">
             <span class="w-2 h-2 bg-current rounded-full animate-pulse"></span>
             RETRACT
          </button>
        </div>

        <!-- Draggable Floating Panels Area (Simulated for UI) -->
        <div class="flex-1 relative pointer-events-auto">
          <!-- Main Data Panel -->
          <div class="absolute top-0 left-0 w-2/3 h-[70vh] bg-[rgba(16,22,34,0.7)] backdrop-blur-xl border border-[rgba(0,240,255,0.3)] shadow-[0_0_30px_rgba(0,240,255,0.05)] flex flex-col">
            <div class="h-8 border-b border-[rgba(0,240,255,0.2)] flex items-center px-4 bg-[rgba(0,240,255,0.05)] cursor-move">
               <span class="text-[0.6rem] text-[#00F0FF] tracking-widest uppercase">Data Matrix // {{ activeModule.id }}</span>
            </div>
            <div class="p-6 flex-1 overflow-auto custom-scrollbar">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="border-b border-[#4A7C82]/30 text-[#4A7C82] text-xs">
                    <th class="py-3 px-4 font-normal tracking-widest">ID</th>
                    <th class="py-3 px-4 font-normal tracking-widest">DESCRIPTOR</th>
                    <th class="py-3 px-4 font-normal tracking-widest">METRIC_1</th>
                    <th class="py-3 px-4 font-normal tracking-widest text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="i in 8" :key="i" class="border-b border-[#4A7C82]/10 hover:bg-[#00F0FF]/5 transition-colors cursor-crosshair">
                    <td class="py-4 px-4 text-[#00F0FF] text-sm">#{{ Math.random().toString(36).substring(2, 6).toUpperCase() }}</td>
                    <td class="py-4 px-4 text-[#E0F7FA] text-sm truncate max-w-[200px]">{{ activeModule.name }} Node Alpha-{{i}}</td>
                    <td class="py-4 px-4 text-[#4A7C82] text-sm font-['JetBrains_Mono']">{{ (Math.random() * 100000).toFixed(2) }}</td>
                    <td class="py-4 px-4 text-right">
                       <span class="px-2 py-1 bg-[#FFB800]/20 text-[#FFB800] text-[0.6rem] border border-[#FFB800]/50 tracking-widest">PENDING</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <!-- Secondary Panel -->
          <div class="absolute top-20 right-0 w-1/3 min-w-[300px] h-[50vh] bg-[rgba(16,22,34,0.7)] backdrop-blur-xl border border-[rgba(0,240,255,0.3)] shadow-[0_0_30px_rgba(0,240,255,0.05)] flex flex-col">
             <div class="h-8 border-b border-[rgba(0,240,255,0.2)] flex items-center px-4 bg-[rgba(0,240,255,0.05)] cursor-move">
               <span class="text-[0.6rem] text-[#00F0FF] tracking-widest uppercase">Telemetry // Target</span>
            </div>
            <div class="p-6 flex-1 flex flex-col items-center justify-center gap-8">
               <div class="relative w-32 h-32 rounded-full border border-[#00F0FF]/30 flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.1)]">
                  <div class="absolute inset-2 border-2 border-dashed border-[#FFB800]/50 rounded-full animate-spin-slow"></div>
                  <span class="text-3xl text-[#00F0FF] font-['JetBrains_Mono'] text-shadow-sm">94%</span>
               </div>
               
               <button class="hold-to-confirm w-full group relative overflow-hidden bg-[rgba(16,22,34,0.8)] border border-[#00F0FF] py-4 text-[#00F0FF] font-['Rajdhani'] font-bold tracking-[0.2em] uppercase text-sm hover:bg-[#00F0FF]/10 transition-colors" @mousedown="startHold" @mouseup="stopHold" @mouseleave="stopHold" @touchstart="startHold" @touchend="stopHold">
                  <span class="relative z-10">Execute Directive</span>
                  <div class="absolute top-0 left-0 h-full bg-[#00F0FF]/25 shadow-[0_0_15px_#00F0FF]" :style="{ width: `${holdProgress}%`, transition: holdProgress === 0 ? 'width 0.2s' : 'none' }"></div>
               </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Command Console (Bottom Anchor) -->
    <div class="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-[#06070D] to-transparent border-t border-[#4A7C82]/30 flex items-end justify-center pb-3 px-10 z-50 pointer-events-none">
      <div class="w-full max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4 pointer-events-auto">
        <div class="text-[#4A7C82] text-[0.6rem] tracking-widest border border-[#4A7C82]/30 px-3 py-1 bg-[#06070D]">
          SYS.LOG: /var/procure/stream
        </div>
        
        <!-- Workflow Pulse Stream -->
        <div class="flex-1 w-full mx-8 h-8 flex items-center justify-between relative hidden sm:flex">
          <div class="absolute top-1/2 w-full h-[1px] bg-[#4A7C82]/30 -translate-y-1/2"></div>
          <div v-for="i in 8" :key="i" class="w-2 h-2 bg-[#00F0FF] rounded-full z-10 shadow-[0_0_8px_#00F0FF]" :class="{'opacity-30 bg-[#4A7C82] shadow-none': i > 5}"></div>
          
          <!-- Pulse animation along the line -->
          <div class="absolute top-1/2 h-[1px] w-20 bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent -translate-y-1/2 animate-pulse-stream"></div>
        </div>
        
        <div class="text-[#00F0FF] text-[0.6rem] tracking-widest border border-[#00F0FF]/50 px-3 py-1 bg-[#06070D] shadow-[0_0_10px_rgba(0,240,255,0.1)]">
          V. 9.4.2 [SECURE]
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const modules = ref([
  { id: 'rfq', name: 'RFQ Creation', status: 'Online', alert: false },
  { id: 'vendor', name: 'Vendor Matrix', status: 'Optimal', alert: false },
  { id: 'quote', name: 'Quote Balancer', status: 'Awaiting', alert: true },
  { id: 'po', name: 'Purchase Orders', status: 'Processing', alert: false },
  { id: 'delivery', name: 'Delivery Radar', status: 'Tracking 4', alert: true },
  { id: 'analytics', name: 'Data Optics', status: 'Synced', alert: false },
])

const activeModule = ref(null)
const holdProgress = ref(0)
let holdTimer = null

// Orbital Math for positioning nodes
const getOrbitStyle = (index, total) => {
  const radius = window.innerWidth < 768 ? 150 : 300 // px
  // offset by -90 deg so the first item naturally sits at the top
  const angle = (index / total) * (2 * Math.PI) - (Math.PI / 2) 
  const x = Math.cos(angle) * radius
  const y = Math.sin(angle) * radius
  
  // Also offset by -50% to center the node on its coordinate
  return {
    transform: `translate(calc(${x}px - 50%), calc(${y}px - 50%))`
  }
}

const openModule = (mod) => {
  activeModule.value = mod
}

const closeModule = () => {
  activeModule.value = null
}

const startHold = () => {
  holdProgress.value = 0
  if(holdTimer) clearInterval(holdTimer)
  holdTimer = setInterval(() => {
    holdProgress.value += 1.5
    if(holdProgress.value >= 100) {
      clearInterval(holdTimer)
      // Execute action
      alert('DIRECTIVE EXECUTED: Transaction logic initiated.')
      holdProgress.value = 0
    }
  }, 20)
}

const stopHold = () => {
  if(holdTimer) clearInterval(holdTimer)
  setTimeout(() => {
      // allow animation to snap back if not successful
      if(holdProgress.value < 100) holdProgress.value = 0;
  }, 50)
}

onMounted(() => {
  // Inject Google Fonts if not present
  if(!document.getElementById('procure-fonts')) {
    const link = document.createElement('link')
    link.id = 'procure-fonts'
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Rajdhani:wght@400;500;600;700&display=swap'
    document.head.appendChild(link)
  }
})
</script>

<style scoped>
/* 
  Custom spatial and cyberpunk CSS
*/
.procure-nexus-app {
  font-family: 'JetBrains Mono', monospace;
}

.spatial-grid {
  background-image: 
    linear-gradient(rgba(74, 124, 130, 0.2) 1px, transparent 1px),
    linear-gradient(90deg, rgba(74, 124, 130, 0.2) 1px, transparent 1px);
  background-size: 60px 60px;
  background-position: center;
  /* Add perspective */
  transform: perspective(100vh) rotateX(60deg) scale(2.5);
  transform-origin: center top;
}

.radar-sweep {
  background: conic-gradient(
    from 0deg,
    transparent 70%,
    rgba(0, 240, 255, 0.1) 80%,
    rgba(0, 240, 255, 0.8) 100%
  );
  border-radius: 50%;
  animation: radar 3s linear infinite;
}

@keyframes radar {
  to { transform: rotate(360deg); }
}

.animate-spin-slow {
  animation: spin 30s linear infinite;
}

.animate-spin-reverse-slow {
  animation: spin-reverse 35s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes spin-reverse {
  to { transform: rotate(-360deg); }
}

.animate-pulse-stream {
  animation: stream 3s linear infinite;
  box-shadow: 0 0 10px #00F0FF;
}

@keyframes stream {
  0% { left: 0%; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { left: 100%; opacity: 0; }
}

/* Warp Transition */
.warp-speed-enter-active,
.warp-speed-leave-active {
  transition: all 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}

.warp-speed-enter-from,
.warp-speed-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(30px);
  filter: blur(12px);
}

.shadow-glow {
  text-shadow: 0 0 15px rgba(0,240,255,0.6), 0 0 30px rgba(0,240,255,0.3);
}

/* Glitch Hover for Hostile Buttons */
.hold-to-confirm:hover::before {
  content: '';
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 240, 255, 0.15);
  transform: translateX(-100%);
  animation: glitch-anim 0.3s steps(2, end) infinite;
  pointer-events: none;
}

@keyframes glitch-anim {
  0% { transform: translate(2px, 2px); }
  25% { transform: translate(-2px, -2px); }
  50% { transform: translate(2px, -2px); }
  75% { transform: translate(-2px, 2px); }
  100% { transform: translate(2px, 2px); }
}

/* Custom Scrollbar for matrix panels */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(0,0,0,0.3);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 240, 255, 0.5);
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 240, 255, 0.8);
}
</style>
