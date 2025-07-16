interface VisionOverlayProps {
  pieceX: number;
  pieceY: number;
  tileSize: number;
  visionRadius: number;
  viewportWidth: number;
  viewportHeight: number;
}

export const VisionOverlay: React.FC<VisionOverlayProps> = ({
  tileSize,
  visionRadius,
  viewportWidth,
  viewportHeight,
}) => {
  const gradientSize = visionRadius * tileSize * 2;

  const pieceCenterX = (viewportHeight / 2) * tileSize;
  const pieceCenterY = (viewportWidth / 2) * tileSize;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: viewportWidth * tileSize,
        height: viewportHeight * tileSize,
        pointerEvents: "none",
        background: `radial-gradient(
              circle ${gradientSize}px at ${pieceCenterX}px ${pieceCenterY}px,
              rgba(0,0,0,0) 0%,
              rgba(0,0,0,0.4) 35%,
              rgba(0,0,0,0.6) 59%,
              rgba(0,0,0,10) 100%
            )`,
        zIndex: 5,
      }}
    />
  );
};
