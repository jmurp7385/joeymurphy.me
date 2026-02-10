
import React, { useCallback, useEffect, useRef, useState } from "react";

const BUTTON_SIZE = 120;
const SHRINK_FACTOR = 0.82;
const GROW_FACTOR = 1.08;
const MIN_SIZE = 64;
const MAX_SIZE = 180;
const minGap = 28;

export default function ValentinePage() {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const [noButton, setNoButton] = useState({ x: 40, y: 220, size: BUTTON_SIZE });
	const [yesButton, setYesButton] = useState({ x: 0, y: 220, size: BUTTON_SIZE });
	const [noHovered, setNoHovered] = useState(false);
	const [congrats, setCongrats] = useState(false);

	// Recenter helper: center Yes under heading and place No beside it
	const recenterButtons = useCallback(() => {
		const container = containerRef.current;
		if (!container) return;
		const rect = container.getBoundingClientRect();
		const header = container.querySelector("h1");
		const headerRect = header ? header.getBoundingClientRect() : null;
		const headerBottom = headerRect ? Math.max(0, headerRect.bottom - rect.top) : Math.max(0, rect.height * 0.12);

		const yesSize = Math.max(MIN_SIZE, Math.min(yesButton.size || BUTTON_SIZE, MAX_SIZE));
		// center under the header text when possible
		const headerCenterX = headerRect ? (headerRect.left - rect.left + headerRect.width / 2) : rect.width / 2;
		const yesCenterX = headerCenterX;
		const yesCenterY = Math.max(headerBottom + yesSize / 2 + 8, rect.height * 0.32);
		const yesX = Math.max(0, Math.min(yesCenterX - yesSize / 2, rect.width - yesSize));
		const yesY = Math.max(0, Math.min(yesCenterY - yesSize / 2, rect.height - yesSize));

		// place No to the left of Yes if space, otherwise to the right
		const noSize = Math.max(MIN_SIZE, Math.min(noButton.size || BUTTON_SIZE, MAX_SIZE));
		let noX = yesX - noSize - 24;
		if (noX < 8) noX = Math.min(rect.width - noSize - 8, yesX + yesSize + 24);
		const noY = yesY;

		setYesButton({ x: yesX, y: yesY, size: yesSize });
		setNoButton((previous) => ({ x: noX, y: noY, size: previous.size }));
		}, [yesButton.size, noButton.size]);

		// initial placement and on mount
		useEffect(() => {
			recenterButtons();
		}, [recenterButtons]);

		// recenter on window resize
		useEffect(() => {
			const onResize = () => recenterButtons();
			window.addEventListener("resize", onResize);
			return () => window.removeEventListener("resize", onResize);
		}, [recenterButtons]);

	const moveNoButton = () => {
		setNoHovered(true);
		const container = containerRef.current;
		if (!container) return;
		const rect = container.getBoundingClientRect();
		let newSize = Math.max(MIN_SIZE, noButton.size * SHRINK_FACTOR);
		const newYesSize = Math.min(MAX_SIZE, yesButton.size * GROW_FACTOR);
		const header = container.querySelector("h1");
		const headerRect = header ? header.getBoundingClientRect() : null;
		// center under the header text when moving No
		const headerCenterX = headerRect ? (headerRect.left - rect.left + headerRect.width / 2) : rect.width / 2;
		const yesCenterX = headerCenterX;
		const headerBottom = headerRect ? Math.max(0, headerRect.bottom - rect.top) : Math.max(0, rect.height * 0.12);
		const yesCenterY = Math.max(headerBottom + newYesSize / 2 + 8, rect.height * 0.30);

		let yesX = yesCenterX - newYesSize / 2;
		let yesY = yesCenterY - newYesSize / 2;
		yesX = Math.max(0, Math.min(yesX, rect.width - newYesSize));
		yesY = Math.max(0, Math.min(yesY, rect.height - newYesSize));

		const maxX = Math.max(0, rect.width - newSize);
		const maxY = Math.max(0, rect.height - newSize);
		let x = 0,
			y = 0,
			tries = 0;

		do {
			x = Math.random() * maxX;
			y = Math.random() * (Math.max(0, maxY - headerBottom)) + headerBottom;
			const noCenterX = x + newSize / 2;
			const noCenterY = y + newSize / 2;
			const distribution = Math.hypot(noCenterX - yesCenterX, noCenterY - yesCenterY);
			if (distribution > (newYesSize + newSize) / 2 + minGap) break;
			tries++;
		} while (tries < 200);

		if (tries >= 200) {
			x = Math.max(0, Math.floor(yesCenterX - newYesSize / 2 - newSize - minGap));
			y = Math.max(headerBottom, Math.floor(yesCenterY - newSize / 2));
			if (x + newSize > rect.width || x < 0) {
				x = Math.min(maxX, Math.floor(yesCenterX + newYesSize / 2 + minGap));
				y = Math.max(headerBottom, Math.floor(yesCenterY - newSize / 2));
			}
			if (x + newSize > rect.width || x < 0) {
				x = Math.max(0, Math.floor(yesCenterX - newSize / 2));
				y = Math.min(maxY, Math.floor(yesCenterY + newYesSize / 2 + minGap));
			}
		}

		x = Math.max(0, Math.min(x, rect.width - newSize));
		y = Math.max(headerBottom, Math.min(y, rect.height - newSize));

		setNoButton({ x, y, size: newSize });
		setYesButton({ x: yesX, y: yesY, size: newYesSize });
	};

	const ParticleLayer = ({ count = 40 }: { count?: number }) => {
		type Particle = { x: number; y: number; vx: number; vy: number; size: number; char: string; rot: number; vr: number };
		const particles = useRef<Particle[]>([]);
		const [, setTick] = useState(0);

		useEffect(() => {
			const container = containerRef.current;
			if (!container) return;
			const rect = container.getBoundingClientRect();
			const header = container.querySelector("h1");
			const headerRect = header ? header.getBoundingClientRect() : null;
			const headerBottom = headerRect ? Math.max(0, headerRect.bottom - rect.top) : Math.max(0, rect.height * 0.12);

			// more energetic initial velocities and random rotation
			// bias initial vertical velocity upward so many particles launch up
			particles.current = Array.from({ length: count }).map(() => ({
				x: Math.random() * Math.max(0, rect.width - 20),
				y: Math.random() * Math.max(0, rect.height - headerBottom) + headerBottom,
				vx: (Math.random() - 0.5) * 6.0,
				// bias towards negative (upwards) and larger magnitude
				vy: (Math.random() - 0.85) * 8.0,
				size: 14 + Math.random() * 28,
				char: Math.random() > 0.5 ? "❤" : "❣",
				rot: Math.random() * 360,
				vr: (Math.random() - 0.5) * 240,
			}));

			let raf = 0;
			let last = performance.now();
			const animate = (now: number) => {
				const dt = Math.min(64, now - last) / 1000;
				last = now;
				for (const p of particles.current) {
					// apply motion
					p.x += p.vx * 60 * dt;
					p.y += p.vy * 60 * dt;
					  // gravity (reduced so particles travel higher before falling)
					  p.vy += 0.03;
					// add per-frame jitter to create agitation
					p.vx += (Math.random() - 0.5) * 0.8;
					p.vy += (Math.random() - 0.5) * 0.4;
					// rotate
					p.rot += p.vr * dt;
					p.vr += (Math.random() - 0.5) * 40 * dt;
					// bounce with stronger restitution so they bounce higher
					if (p.x < 0) {
						p.x = 0;
						p.vx *= -0.8;
					}
					if (p.x > rect.width - p.size) {
						p.x = rect.width - p.size;
						p.vx *= -0.8;
					}
					if (p.y < headerBottom) {
						p.y = headerBottom;
						p.vy *= -0.9;
					}
					if (p.y > rect.height - p.size) {
						p.y = rect.height - p.size;
						p.vy *= -0.9;
					}
				}
				setTick((t) => t + 1);
				raf = requestAnimationFrame(animate);
			};
			raf = requestAnimationFrame(animate);
			return () => cancelAnimationFrame(raf);
		}, [count]);

		return (
			<div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
				{particles.current.map((p, index) => (
					<span
						key={index}
						style={{
							position: "absolute",
							left: 0,
							top: 0,
							transform: `translate3d(${Math.round(p.x)}px, ${Math.round(p.y)}px, 0) rotate(${Math.round(p.rot)}deg)`,
							fontSize: p.size,
							color: "#ff5eae",
							textShadow: "0 6px 18px rgba(215,38,96,0.25)",
							willChange: "transform",
						}}
					>
						{p.char}
					</span>
				))}
			</div>
		);
	};

	const handleMouseMove = (event: React.MouseEvent) => {
		const container = containerRef.current;
		if (!container) return;
		const rect = container.getBoundingClientRect();
		const mouseX = event.clientX - rect.left;
		const mouseY = event.clientY - rect.top;
		const dx = mouseX - (noButton.x + noButton.size / 2);
		const dy = mouseY - (noButton.y + noButton.size / 2);
		const distance = Math.sqrt(dx * dx + dy * dy);
		if (distance < noButton.size * 1.2) {
			if (noHovered) moveNoButton();
			else setNoHovered(true);
		}
	};

	return (
		<div
			ref={containerRef}
			style={{
				width: "100vw",
				height: "100vh",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				background: "#fff0f6",
				overflow: "hidden",
				position: "relative",
			}}
			onMouseMove={handleMouseMove}
		>
			<h1 style={{ position: "absolute", top: "28%", fontSize: 36, color: "#d72660", marginBottom: 24 }}>
				Will you be my valentine?
			</h1>

			<div style={{ width: "100vw", height: "100vh", position: "relative" }}>
				{/* Centered group under the heading */}
				<div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", top: yesButton.y, display: "flex", gap: 24, alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
					{!congrats && !noHovered && (
						<button
							style={{
								width: noButton.size,
								height: noButton.size,
								fontSize: noButton.size / 5,
								borderRadius: "50%",
								background: "#bdbdbd",
								color: "#fff",
								border: "none",
								boxShadow: "0 4px 16px #88888840",
								transition: "transform 0.25s ease",
								zIndex: 3,
								pointerEvents: "auto",
							}}
							onMouseEnter={() => { if (noHovered) moveNoButton(); else setNoHovered(true); }}
							onClick={() => alert("Are you sure? 😢")}
						>
							No
						</button>
					)}

					{/* Yes button in the centered group */}
					<button
						style={{
							width: yesButton.size,
							height: yesButton.size,
							fontSize: yesButton.size / 5,
							borderRadius: "50%",
							background: "#ff5eae",
							color: "white",
							border: "none",
							boxShadow: "0 4px 16px #d7266040",
							transition: "transform 0.2s ease",
							zIndex: 2,
							pointerEvents: "auto",
						}}
						onClick={() => setCongrats(true)}
					>
						Yes
					</button>
				</div>

				{/* Absolute No once it has moved */}
				{!congrats && noHovered && (
					<button
						style={{
							width: noButton.size,
							height: noButton.size,
							fontSize: noButton.size / 5,
							borderRadius: "50%",
							background: "#bdbdbd",
							color: "#fff",
							border: "none",
							boxShadow: "0 4px 16px #88888840",
							transition: "transform 0.35s cubic-bezier(.4,2,.6,1), width 0.2s, height 0.2s",
							zIndex: 3,
							position: "absolute",
							left: 0,
							top: 0,
							transform: `translate3d(${noButton.x}px, ${noButton.y}px, 0)`,
							transformOrigin: "center",
						}}
						onMouseEnter={() => moveNoButton()}
						onClick={() => alert("Are you sure? 😢")}
					>
						No
					</button>
				)}
				{congrats && (
					<>
						<div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", background: "transparent", zIndex: 50, marginTop: 24 }}>
							<h2 style={{ color: "#d72660", fontSize: 36, textAlign: "center", marginBottom: 24 }}>congratulations, you chose correctly!</h2>
							<div className="hearts" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
								{Array.from({ length: 14 }).map((_, index) => (
									<span key={index} className="heart" style={{ left: `${10 + Math.random() * 80}%`, animationDelay: `${Math.random() * 0.6}s`, fontSize: `${16 + Math.random() * 28}px`, position: 'absolute', top: '50%' }}>
										❤
									</span>
								))}
							</div>
						</div>
						<ParticleLayer count={44} />
					</>
				)}
			</div>

			<style jsx>{`
				.heart {
					color: #ff5eae;
					text-shadow: 0 8px 20px rgba(215,38,96,0.25);
					animation: agitatedRise 1.0s cubic-bezier(.2,.8,.2,1) forwards;
				}
				@keyframes agitatedRise {
					0% { transform: translateY(0) translateX(0) rotate(0) scale(0.85); opacity: 1; }
					30% { transform: translateY(-60px) translateX(12px) rotate(18deg) scale(1); opacity: 1; }
						60% { transform: translateY(-200px) translateX(-18px) rotate(-18deg) scale(1.05); opacity: 1; }
						100% { transform: translateY(-420px) translateX(12px) rotate(8deg) scale(1.18); opacity: 0; }
				}
			`}</style>
		</div>
	);
}

