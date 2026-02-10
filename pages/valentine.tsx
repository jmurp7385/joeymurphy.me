
import React, { useEffect, useRef, useState } from "react";


const BUTTON_SIZE = 120;
const SHRINK_FACTOR = 0.75;
const GROW_FACTOR = 1.5;
const MIN_SIZE = 10;
const MAX_SIZE = 400;

const minGap = 20;

export default function ValentinePage() {
	const [noButton, setNoButton] = useState({
		x: 0,
		y: 0,
		size: BUTTON_SIZE,
	});
	const [yesButton, setYesButton] = useState({
		x: 0,
		y: 0,
		size: BUTTON_SIZE,
	});
	const [noHovered, setNoHovered] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	// Move the No button to a random position within the container, avoiding overlap with Yes


	// Place both buttons on initial render as a centered pair (coordinates)
	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;
		const rect = container.getBoundingClientRect();
		const yesSize = BUTTON_SIZE;
		const noSize = BUTTON_SIZE;
		const gap = minGap;
		const totalWidth = yesSize + noSize + gap;
		const left = rect.width / 2 - totalWidth / 2;
		// compute header bottom so buttons sit just below the heading
		const header = container.querySelector("h1");
		const headerRect = header ? header.getBoundingClientRect() : null;
		const headerBottom = headerRect ? Math.max(0, headerRect.bottom - rect.top) : Math.max(0, rect.height * 0.12);
		const centerY = headerBottom + yesSize / 2 + 8; // place buttons just under heading
		let noX = left;
		let yesX = left + noSize + gap;
		let noY = centerY - noSize / 2;
		let yesY = centerY - yesSize / 2;
		// clamp to ensure fully visible on small screens
		noX = Math.max(0, Math.min(noX, rect.width - noSize));
		yesX = Math.max(0, Math.min(yesX, rect.width - yesSize));
		noY = Math.max(0, Math.min(noY, rect.height - noSize));
		yesY = Math.max(0, Math.min(yesY, rect.height - yesSize));
		setNoButton({ x: noX, y: noY, size: noSize });
		setYesButton({ x: yesX, y: yesY, size: yesSize });
	}, []);

	const moveNoButton = () => {
		setNoHovered(true);
		const container = containerRef.current;
		if (!container) return;
		const rect = container.getBoundingClientRect();
		let newSize = Math.max(MIN_SIZE, noButton.size * SHRINK_FACTOR);
		// Keep Yes centered; compute its new size when it grows
		const newYesSize = Math.min(MAX_SIZE, yesButton.size * GROW_FACTOR);
		const yesCenterX = rect.width / 2;
		// compute header bottom so buttons don't overlap heading
		const header = container.querySelector("h1");
		const headerRect = header ? header.getBoundingClientRect() : null;
		const headerBottom = headerRect ? Math.max(0, headerRect.bottom - rect.top) : Math.max(0, rect.height * 0.12);
		const yesCenterY = Math.max(headerBottom + newYesSize / 2 + 8, rect.height * 0.30);
		let yesX = yesCenterX - newYesSize / 2;
		let yesY = yesCenterY - newYesSize / 2;
		// clamp Yes to stay fully visible
		yesX = Math.max(0, Math.min(yesX, rect.width - newYesSize));
		yesY = Math.max(0, Math.min(yesY, rect.height - newYesSize));
		// Choose a random position for No that keeps it entirely visible and not overlapping Yes
		const maxX = Math.max(0, rect.width - newSize);
		const maxY = Math.max(0, rect.height - newSize);
		let x = 0, y = 0, tries = 0;
		do {
			x = Math.random() * maxX;
			// keep No below headerBottom so it doesn't cover the heading
			y = Math.random() * (Math.max(0, maxY - headerBottom)) + headerBottom;
			const noCenterX = x + newSize / 2;
			const noCenterY = y + newSize / 2;
			const distribution = Math.hypot(noCenterX - yesCenterX, noCenterY - yesCenterY);
			// require a minimum distance so they don't overlap or touch
			if (distribution > (newYesSize + newSize) / 2 + minGap) break;
			tries++;
		} while (tries < 200);
		// If random sampling failed, place deterministically left/right/below Yes
		if (tries >= 200) {
			// try left
			x = Math.max(0, Math.floor(yesCenterX - newYesSize / 2 - newSize - minGap));
			y = Math.max(headerBottom, Math.floor(yesCenterY - newSize / 2));
			if (x + newSize > rect.width || x < 0) {
				// try right
				x = Math.min(maxX, Math.floor(yesCenterX + newYesSize / 2 + minGap));
				y = Math.max(headerBottom, Math.floor(yesCenterY - newSize / 2));
			}
			if (x + newSize > rect.width || x < 0) {
				// try below
				x = Math.max(0, Math.floor(yesCenterX - newSize / 2));
				y = Math.min(maxY, Math.floor(yesCenterY + newYesSize / 2 + minGap));
			}
		}
		// Ensure coordinates stay within bounds and below the header
		x = Math.max(0, Math.min(x, rect.width - newSize));
		y = Math.max(headerBottom, Math.min(y, rect.height - newSize));
		setNoButton({ x, y, size: newSize });
		setYesButton({ x: yesX, y: yesY, size: newYesSize });
	};

	// Detect if mouse is near the No button
	const handleMouseMove = (error: React.MouseEvent) => {
		const container = containerRef.current;
		if (!container) return;
		const rect = container.getBoundingClientRect();
		const mouseX = error.clientX - rect.left;
		const mouseY = error.clientY - rect.top;
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
				cursor: "pointer",
			}}
			onMouseMove={handleMouseMove}
		>
          <h1 style={{ position: 'absolute', top: '35%', fontSize: 36, color: "#d72660", marginBottom: 24 }}>
            Will you be my valentine?
          </h1>
			<div
				style={{
          width: "100vw",
					height: "100vh",
					position: "relative",
				}}
			>
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
					onMouseEnter={() => { if (noHovered) moveNoButton(); else setNoHovered(true); }}
					onClick={() => alert("Are you sure? 😢")}
				>
					No
				</button>
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
						transition: "left 0.35s cubic-bezier(.4,2,.6,1), top 0.35s cubic-bezier(.4,2,.6,1), width 0.2s, height 0.2s",
						zIndex: 2,
						position: "absolute",
						left: yesButton.x,
						top: yesButton.y,
					}}
					onClick={() => alert("Yay! 💖")}
				>
					Yes
				</button>
			</div>
		</div>
	);
}
