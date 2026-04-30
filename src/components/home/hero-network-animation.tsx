"use client";

import { useEffect, useRef } from "react";

const NAVY = "#1B2A4A";
const COPPER = "#B87333";
const TEAL = "#2A7B88";
const GREY = "#D7E2E6";

type NodeItem = {
  id: number;
  label: string;
  role: "owner" | "pro";
  baseX: number;
  baseY: number;
  color: string;
  r: number;
  x: number;
  y: number;
  pulse: number;
};

export function HeroNetworkAnimation() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const scene = sceneRef.current;
    if (!canvas || !scene) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const getW = () => canvas.width / dpr;
    const getH = () => canvas.height / dpr;

    const nodes: NodeItem[] = [
      { id: 0, label: "Project\nOwner", role: "owner", baseX: 0.5, baseY: 0.18, color: COPPER, r: 34, x: 0, y: 0, pulse: 0 },
      { id: 1, label: "Contractor\nA", role: "pro", baseX: 0.18, baseY: 0.55, color: NAVY, r: 26, x: 0, y: 0, pulse: 0 },
      { id: 2, label: "Contractor\nB", role: "pro", baseX: 0.38, baseY: 0.72, color: NAVY, r: 26, x: 0, y: 0, pulse: 0 },
      { id: 3, label: "Engineer\nA", role: "pro", baseX: 0.62, baseY: 0.72, color: TEAL, r: 26, x: 0, y: 0, pulse: 0 },
      { id: 4, label: "Engineer\nB", role: "pro", baseX: 0.82, baseY: 0.55, color: TEAL, r: 26, x: 0, y: 0, pulse: 0 },
    ];
    const rasi = { baseX: 0.5, baseY: 0.5, r: 38, x: 0, y: 0 };
    const packets: Array<{ fromIdx: number; toRasi: boolean; color: string; progress: number; speed: number }> = [];
    const directPackets: Array<{
      fromIdx: number;
      toIdx: number;
      color: string;
      progress: number;
      speed: number;
      kind: "bid" | "award";
    }> = [];
    const rasiLogo = new Image();
    rasiLogo.src = "/logo.jpg";

    const resize = () => {
      const rect = scene.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);
    const lerpPos = (a: { x: number; y: number }, b: { x: number; y: number }, t: number) => ({
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
    });

    const drawRoundRect = (x: number, y: number, w: number, h: number, r: number, fill: string, stroke?: string, strokeW = 1) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
      if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = strokeW;
        ctx.stroke();
      }
    };

    const drawNode = (n: NodeItem) => {
      const pulse = Math.sin(n.pulse) * 0.4 + 0.6;
      const glow = n.r + 8 + pulse * 6;
      ctx.beginPath();
      ctx.arc(n.x, n.y, glow, 0, Math.PI * 2);
      ctx.fillStyle = `${n.color}18`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = n.color;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();

      if (n.role === "owner") {
        // Person on chair using laptop icon
        ctx.strokeStyle = "#fff";
        ctx.fillStyle = "#fff";
        ctx.lineWidth = 1.8;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        // head
        ctx.beginPath();
        ctx.arc(n.x - 4, n.y - 8, 3.2, 0, Math.PI * 2);
        ctx.fill();

        // torso
        ctx.beginPath();
        ctx.moveTo(n.x - 4, n.y - 4);
        ctx.lineTo(n.x - 4, n.y + 4);
        ctx.stroke();

        // arm to laptop
        ctx.beginPath();
        ctx.moveTo(n.x - 4, n.y - 1);
        ctx.lineTo(n.x + 3, n.y + 1);
        ctx.stroke();

        // chair back
        ctx.beginPath();
        ctx.moveTo(n.x - 10, n.y - 2);
        ctx.lineTo(n.x - 10, n.y + 8);
        ctx.lineTo(n.x - 2, n.y + 8);
        ctx.stroke();

        // chair seat
        ctx.beginPath();
        ctx.moveTo(n.x - 8, n.y + 4);
        ctx.lineTo(n.x - 1, n.y + 4);
        ctx.stroke();

        // legs
        ctx.beginPath();
        ctx.moveTo(n.x - 4, n.y + 4);
        ctx.lineTo(n.x - 8, n.y + 9);
        ctx.moveTo(n.x - 4, n.y + 4);
        ctx.lineTo(n.x, n.y + 9);
        ctx.stroke();

        // laptop
        ctx.strokeRect(n.x + 2, n.y - 2.5, 8, 6);
        ctx.beginPath();
        ctx.moveTo(n.x + 1, n.y + 4);
        ctx.lineTo(n.x + 11, n.y + 4);
        ctx.stroke();

        // owner label (two lines, inside circle)
        ctx.fillStyle = "#fff";
        ctx.font = "600 7px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Project", n.x, n.y + n.r - 13);
        ctx.fillText("Owner", n.x, n.y + n.r - 6);
        return;
      }

      ctx.fillStyle = "#fff";
      ctx.font = "500 10px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const lines = n.label.split("\n");
      const lh = 13;
      lines.forEach((line, i) => {
        ctx.fillText(line, n.x, n.y + (i - (lines.length - 1) / 2) * lh);
      });
    };

    const drawRasiNode = (t: number) => {
      const pulse = Math.sin(t * 0.04) * 0.5 + 0.5;
      for (let i = 3; i >= 1; i -= 1) {
        ctx.beginPath();
        ctx.arc(rasi.x, rasi.y, rasi.r + i * 10 + pulse * 4, 0, Math.PI * 2);
        ctx.strokeStyle = `${COPPER}${(30 - i * 8).toString(16).padStart(2, "0")}`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(rasi.x, rasi.y, rasi.r, 0, Math.PI * 2);
      ctx.fillStyle = NAVY;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(rasi.x, rasi.y, rasi.r, 0, Math.PI * 2);
      ctx.strokeStyle = COPPER;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      if (rasiLogo.complete && rasiLogo.naturalWidth > 0) {
        const size = rasi.r * 1.38;
        ctx.save();
        ctx.beginPath();
        ctx.arc(rasi.x, rasi.y, rasi.r - 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.fillStyle = "rgba(255,255,255,0.94)";
        ctx.fillRect(rasi.x - rasi.r, rasi.y - rasi.r, rasi.r * 2, rasi.r * 2);
        ctx.drawImage(rasiLogo, rasi.x - size / 2, rasi.y - size / 2, size, size);
        ctx.restore();
      } else {
        ctx.fillStyle = "#fff";
        ctx.font = "600 12px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("RASI", rasi.x, rasi.y);
      }
    };

    const drawEdge = (a: { x: number; y: number }, b: { x: number; y: number }) => {
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = "rgba(215,226,230,0.45)";
      ctx.lineWidth = 1.4;
      ctx.setLineDash([4, 6]);
      ctx.stroke();
      ctx.setLineDash([]);
    };

    const drawVerifiedBadge = (n: NodeItem) => {
      const bx = n.x + n.r * 0.65;
      const by = n.y - n.r * 0.65;
      ctx.beginPath();
      ctx.arc(bx, by, 8, 0, Math.PI * 2);
      ctx.fillStyle = TEAL;
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "500 8px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("✓", bx, by);
    };

    const drawBidReturnLabels = (tick: number) => {
      const cycleTick = tick % FLOW_CYCLE;
      if (cycleTick < STAGE_4_END) return;

      const owner = nodes[0];
      const bidders = nodes.filter((n) => n.role === "pro");
      ctx.font = "500 8px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      bidders.forEach((n, i) => {
        const mx = owner.x + (n.x - owner.x) * 0.2;
        const my = owner.y + (n.y - owner.y) * 0.2;
        const text = `Bid ${i + 1}`;
        const tw = ctx.measureText(text).width;
        const w = tw + 16;
        const h = 16;
        drawRoundRect(mx - w / 2, my - h / 2, w, h, 5, "rgba(30,41,59,0.9)", "rgba(94,234,212,0.55)", 1.2);
        ctx.fillStyle = "#EAF1F4";
        ctx.fillText(text, mx, my + 0.2);
      });
    };

    const getWinnerIndex = (tick: number) => {
      const cycleNo = Math.floor(tick / FLOW_CYCLE);
      const winnerOrder = [4, 3, 2, 1]; // rotate winners across cycles
      return winnerOrder[cycleNo % winnerOrder.length];
    };

    const drawAwardCelebration = (tick: number) => {
      const cycleTick = tick % FLOW_CYCLE;
      const allBidsReceived = bidReceivedInCycle.every(Boolean);
      const celebrationReady =
        awardSentInCycle && awardSentTickInCycle >= 0 && tick - awardSentTickInCycle >= CELEBRATION_DELAY_TICKS;
      if (cycleTick < STAGE_5_END || !allBidsReceived || !celebrationReady) return;

      const winner = nodes[getWinnerIndex(tick)];
      if (!winner) return;
      const pulse = Math.sin(tick * 0.12) * 0.5 + 0.5;

      // Highlight winner node
      ctx.beginPath();
      ctx.arc(winner.x, winner.y, winner.r + 10 + pulse * 7, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(184,115,51,0.2)";
      ctx.fill();

      const awardText = `${winner.label.replace("\n", " ")} awarded`;
      ctx.font = "600 9px sans-serif";
      const tw = ctx.measureText(awardText).width;
      const w = tw + 16;
      const h = 18;
      const tx = winner.x;
      const ty = winner.y - winner.r - 16;
      drawRoundRect(tx - w / 2, ty - h / 2, w, h, 5, "rgba(184,115,51,0.92)", "rgba(255,255,255,0.52)", 1);
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(awardText, tx, ty + 0.5);

      // Celebration confetti
      for (let i = 0; i < 10; i += 1) {
        const angle = (Math.PI * 2 * i) / 10 + tick * 0.02;
        const r = winner.r + 14 + (i % 3) * 5 + pulse * 6;
        const cx = winner.x + Math.cos(angle) * r;
        const cy = winner.y + Math.sin(angle) * r;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle + tick * 0.03);
        ctx.fillStyle = i % 2 === 0 ? "rgba(184,115,51,0.95)" : "rgba(42,123,136,0.95)";
        ctx.fillRect(-2, -1.2, 4, 2.4);
        ctx.restore();
      }
    };

    const FLOW_CYCLE = 910; // keep award visible ~2s longer before restart
    const CELEBRATION_DELAY_TICKS = 120; // ~2s at 60fps
    const STAGE_1_END = 170; // owner publishes to Rasi
    const STAGE_2_END = 300; // Rasi reviews
    const STAGE_3_END = 400; // Rasi approves
    const STAGE_4_END = 480; // notify all related professionals
    const STAGE_5_END = 600; // bids back to owner
    const STAGE_6_END = FLOW_CYCLE; // owner selects winner and approves

    const getFlowStageText = (tick: number) => {
      const cycleTick = tick % FLOW_CYCLE;
      const allBidsReceived = bidReceivedInCycle.every(Boolean);
      if (cycleTick < STAGE_1_END) return "Project Owner publishes project";
      if (cycleTick < STAGE_2_END) return "Rasi reviews project";
      if (cycleTick < STAGE_3_END) return "Rasi approves project";
      if (cycleTick < STAGE_4_END) return "Notify all matching engineer and contractor";
      if (cycleTick < STAGE_5_END || !allBidsReceived) return "Bids 1,2,3,4 go directly to Project Owner";
      return "Project Owner selects one and approves";
    };

    const drawStatusLabel = (t: number) => {
      const text = getFlowStageText(t);
      const x = rasi.x;
      const y = rasi.y - rasi.r - 24;
      ctx.font = "500 10px sans-serif";
      const tw = ctx.measureText(text).width;
      drawRoundRect(x - tw / 2 - 10, y - 9, tw + 20, 18, 4, `${COPPER}f0`, COPPER, 1);
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, x, y);
    };

    const spawnPacket = (fromIdx: number, toRasi: boolean, color: string) => {
      packets.push({
        fromIdx,
        toRasi,
        color,
        progress: 0,
        speed: 0.007 + Math.random() * 0.004,
      });
    };

    const spawnDirectPacket = (fromIdx: number, toIdx: number, color: string, kind: "bid" | "award") => {
      directPackets.push({
        fromIdx,
        toIdx,
        color,
        progress: 0,
        speed: 0.0075 + Math.random() * 0.004,
        kind,
      });
    };

    let t = 0;
    let spawnTimer = 0;
    let lastSpawn = 0;
    let initialOwnerPacketSentInCycle = false;
    let notificationSentInCycle = false;
    let bidsBurstSentInCycle = false;
    let awardSentInCycle = false;
    let awardSentTickInCycle = -1;
    let bidSentInCycle = [false, false, false, false];
    let bidReceivedInCycle = [false, false, false, false];
    let raf = 0;

    const draw = () => {
      ctx.clearRect(0, 0, getW(), getH());
      rasi.x = getW() * rasi.baseX;
      rasi.y = getH() * rasi.baseY;

      nodes.forEach((n) => {
        n.x = getW() * n.baseX + Math.sin(t * 0.0045 + n.id * 1.2) * 5;
        n.y = getH() * n.baseY + Math.cos(t * 0.004 + n.id * 0.9) * 4;
        n.pulse += 0.025;
      });

      nodes.forEach((n) => drawEdge(n, rasi));

      packets.forEach((p) => {
        p.progress += p.speed;
        const from = p.toRasi ? nodes[p.fromIdx] : rasi;
        const to = p.toRasi ? rasi : nodes[p.fromIdx];
        const pos = lerpPos(from, to, easeInOut(p.progress));
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}40`;
        ctx.fill();
      });
      directPackets.forEach((p) => {
        p.progress += p.speed;
        const from = nodes[p.fromIdx];
        const to = nodes[p.toIdx];
        const pos = lerpPos(from, to, easeInOut(p.progress));
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 4.6, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 7.6, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}38`;
        ctx.fill();
      });

      for (let i = packets.length - 1; i >= 0; i -= 1) {
        if (packets[i].progress >= 1) packets.splice(i, 1);
      }
      for (let i = directPackets.length - 1; i >= 0; i -= 1) {
        if (directPackets[i].progress >= 1) {
          const completed = directPackets[i];
          // Count bid as received only when it reaches Project Owner.
          if (completed.kind === "bid" && completed.toIdx === 0 && completed.fromIdx >= 1 && completed.fromIdx <= 4) {
            bidReceivedInCycle[completed.fromIdx - 1] = true;
          }
          directPackets.splice(i, 1);
        }
      }

      spawnTimer += 1;
      const cycleTick = t % FLOW_CYCLE;
      if (cycleTick < 2) {
        initialOwnerPacketSentInCycle = false;
        notificationSentInCycle = false;
        bidsBurstSentInCycle = false;
        awardSentInCycle = false;
        awardSentTickInCycle = -1;
        bidSentInCycle = [false, false, false, false];
        bidReceivedInCycle = [false, false, false, false];
      }
      const allBidsReceived = bidReceivedInCycle.every(Boolean);

      if (spawnTimer - lastSpawn > 52) {
        lastSpawn = spawnTimer;
        const ownerIdx = 0;
        const proIndexes = [1, 2, 3, 4];

        // Stage 1: Owner publishes project to Rasi
        if (cycleTick < STAGE_1_END) {
          if (!initialOwnerPacketSentInCycle) {
            spawnPacket(ownerIdx, true, COPPER);
            initialOwnerPacketSentInCycle = true;
          }
        }
        // Stage 2: Rasi reviews
        else if (cycleTick < STAGE_2_END) {
          if (Math.random() > 0.72) spawnPacket(ownerIdx, true, GREY);
        }
        // Stage 3: Rasi approves
        else if (cycleTick < STAGE_3_END) {
          if (Math.random() > 0.62) spawnPacket(ownerIdx, true, COPPER);
        }
        // Stage 4: Notify all related contractors/engineers at same time
        else if (cycleTick < STAGE_4_END) {
          if (!notificationSentInCycle) {
            proIndexes.forEach((target) => spawnPacket(target, false, COPPER));
            notificationSentInCycle = true;
          }
          if (Math.random() > 0.75) {
            spawnPacket(ownerIdx, true, GREY);
          }
        }
        // Stage 5: Contractors/Engineers send bids directly to Project Owner
        else if (cycleTick < STAGE_5_END || !allBidsReceived) {
          // Send all 4 bids quickly so owner can receive and proceed to award stage.
          if (!bidsBurstSentInCycle) {
            proIndexes.forEach((sender) => {
              bidSentInCycle[sender - 1] = true;
              spawnDirectPacket(sender, ownerIdx, TEAL, "bid");
            });
            bidsBurstSentInCycle = true;
          } else {
            const pending = proIndexes.filter((idx) => !bidReceivedInCycle[idx - 1]);
            if (pending.length > 0 && Math.random() > 0.72) {
              const sender = pending[Math.floor(Math.random() * pending.length)];
              spawnDirectPacket(sender, ownerIdx, TEAL, "bid");
            }
          }
        }
        // Stage 6: Owner approves selected winner
        else if (cycleTick < STAGE_6_END && allBidsReceived) {
          const winnerIdx = getWinnerIndex(t);
          if (!awardSentInCycle) {
            spawnDirectPacket(ownerIdx, winnerIdx, COPPER, "award");
            awardSentInCycle = true;
            awardSentTickInCycle = t;
          }
        }
      }

      nodes.forEach(drawNode);
      nodes.filter((n) => n.role === "pro").forEach(drawVerifiedBadge);
      drawRasiNode(t);
      drawBidReturnLabels(t);
      drawAwardCelebration(t);
      drawStatusLabel(t);

      t += 1;
      raf = window.requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={sceneRef}
      style={{
        width: "100%",
        aspectRatio: "1 / 1",
        maxWidth: "480px",
        marginInline: "auto",
        position: "relative",
      }}
      aria-label="Animated illustration showing Rasi connecting project owners with contractors and engineers through a live bidding network"
    >
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
    </div>
  );
}
