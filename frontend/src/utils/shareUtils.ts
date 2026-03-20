import { THEMES, type ThemeId } from "../utils/themes";
import { THEME_ORDER } from "../utils/progressHelpers";

const POSTCARD_WIDTH = 1200;
const POSTCARD_HEIGHT = 800;
const COLLECTION_WIDTH = 1080;
const COLLECTION_HEIGHT = 1920;

interface TranslationFn {
  (key: string): string;
}

function createLinearGradient(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  colors: [string, string],
): CanvasGradient {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, colors[0]);
  gradient.addColorStop(1, colors[1]);
  return gradient;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
}

function drawDashedBorder(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  color: string,
  lineWidth: number,
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.setLineDash([12, 8]);
  drawRoundedRect(ctx, x, y, width, height, radius);
  ctx.stroke();
  ctx.setLineDash([]);
}

interface PostcardFrameConfig {
  width: number;
  height: number;
  gradient: [string, string];
  accent: string;
  stamp: string;
  padding?: number;
  borderRadius?: number;
}

function drawPostcardFrame(
  ctx: CanvasRenderingContext2D,
  config: PostcardFrameConfig,
) {
  const {
    width,
    height,
    gradient,
    accent,
    stamp,
    padding = 40,
    borderRadius = 30,
  } = config;

  // Background gradient
  ctx.fillStyle = createLinearGradient(ctx, width, height, gradient);
  drawRoundedRect(ctx, 0, 0, width, height, borderRadius);
  ctx.fill();

  // Dashed border
  drawDashedBorder(
    ctx,
    padding,
    padding,
    width - padding * 2,
    height - padding * 2,
    borderRadius - 10,
    accent,
    4,
  );

  // Stamp (top-right)
  const stampSize = Math.min(100, width * 0.1);
  const stampX = width - padding - stampSize - 40;
  const stampY = padding + 40;

  ctx.save();
  ctx.translate(stampX + stampSize / 2, stampY + stampSize / 2);
  ctx.rotate((6 * Math.PI) / 180);
  ctx.translate(-(stampX + stampSize / 2), -(stampY + stampSize / 2));

  ctx.strokeStyle = accent;
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 6]);
  drawRoundedRect(ctx, stampX, stampY, stampSize, stampSize, 8);
  ctx.stroke();
  ctx.setLineDash([]);

  // Stamp emoji
  ctx.font = `${Math.floor(stampSize * 0.48)}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = accent;
  ctx.fillText(stamp, stampX + stampSize / 2, stampY + stampSize / 2);
  ctx.restore();

  // Emoji watermark (top-left)
  ctx.globalAlpha = 0.15;
  ctx.font = `${Math.min(120, width * 0.12)}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(stamp, padding + 100, padding + 100);
  ctx.globalAlpha = 1;
}

function drawPostcardBranding(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  accent: string,
  padding: number = 40,
) {
  ctx.fillStyle = accent;
  ctx.globalAlpha = 0.5;
  ctx.font = "20px sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(
    "Word Search Explorer",
    width - padding - 40,
    height - padding - 20,
  );
  ctx.globalAlpha = 1;
}

function drawMiniPostcard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  gradient: [string, string],
  accent: string,
  stamp: string,
) {
  const borderRadius = 8;
  const padding = Math.floor(width * 0.05);

  // Background gradient
  const cardGradient = ctx.createLinearGradient(x, y, x + width, y + height);
  cardGradient.addColorStop(0, gradient[0]);
  cardGradient.addColorStop(1, gradient[1]);
  ctx.fillStyle = cardGradient;
  drawRoundedRect(ctx, x, y, width, height, borderRadius);
  ctx.fill();

  // Inset dashed border
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 3]);
  drawRoundedRect(
    ctx,
    x + padding,
    y + padding,
    width - padding * 2,
    height - padding * 2,
    borderRadius - 2,
  );
  ctx.stroke();
  ctx.setLineDash([]);

  // Rotated stamp in top-right
  const stampSize = Math.floor(width * 0.22);
  const stampX = x + width - padding - stampSize - 4;
  const stampY = y + padding + 4;

  ctx.save();
  ctx.translate(stampX + stampSize / 2, stampY + stampSize / 2);
  ctx.rotate((6 * Math.PI) / 180);
  ctx.translate(-(stampX + stampSize / 2), -(stampY + stampSize / 2));

  ctx.strokeStyle = accent;
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 2]);
  drawRoundedRect(ctx, stampX, stampY, stampSize, stampSize, 3);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.font = `${Math.floor(stampSize * 0.6)}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = accent;
  ctx.fillText(stamp, stampX + stampSize / 2, stampY + stampSize / 2);
  ctx.restore();

  // Watermark emoji (semi-transparent, bottom-left area)
  ctx.globalAlpha = 0.15;
  ctx.font = `${Math.floor(width * 0.35)}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(stamp, x + width * 0.35, y + height * 0.6);
  ctx.globalAlpha = 1;
}

export async function generatePostcardImage(
  themeId: ThemeId,
  t: TranslationFn,
): Promise<Blob> {
  const theme = THEMES[themeId];
  const canvas = document.createElement("canvas");
  canvas.width = POSTCARD_WIDTH;
  canvas.height = POSTCARD_HEIGHT;
  const ctx = canvas.getContext("2d")!;

  const padding = 40;

  // Draw postcard frame (background, border, stamp, watermark)
  drawPostcardFrame(ctx, {
    width: POSTCARD_WIDTH,
    height: POSTCARD_HEIGHT,
    gradient: theme.gradient,
    accent: theme.accent,
    stamp: theme.postcard.stamp,
    padding,
  });

  // Content (bottom section)
  const contentY = POSTCARD_HEIGHT - 200;

  // Dashed divider
  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.moveTo(padding + 40, contentY);
  ctx.lineTo(padding + 140, contentY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Title
  ctx.fillStyle = theme.accent;
  ctx.font = "bold 48px Georgia, serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(t(theme.postcard.titleKey), padding + 40, contentY + 20);

  // Description
  ctx.font = "32px Georgia, serif";
  ctx.globalAlpha = 0.8;
  ctx.fillText(t(theme.postcard.descriptionKey), padding + 40, contentY + 80);
  ctx.globalAlpha = 1;

  // Branding
  drawPostcardBranding(
    ctx,
    POSTCARD_WIDTH,
    POSTCARD_HEIGHT,
    theme.accent,
    padding,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to generate image"));
      },
      "image/png",
      1,
    );
  });
}

export async function generateCollectionImage(
  earnedCount: number,
  totalCount: number,
  earnedThemes: ThemeId[],
  t: TranslationFn,
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = COLLECTION_WIDTH;
  canvas.height = COLLECTION_HEIGHT;
  const ctx = canvas.getContext("2d")!;

  const padding = 40;
  const collectionGradient: [string, string] = ["#e0f2fe", "#bae6fd"];
  const collectionAccent = "#0369a1";
  const collectionStamp = "📬";

  // Draw postcard frame (background, border, stamp, watermark)
  drawPostcardFrame(ctx, {
    width: COLLECTION_WIDTH,
    height: COLLECTION_HEIGHT,
    gradient: collectionGradient,
    accent: collectionAccent,
    stamp: collectionStamp,
    padding,
  });

  // Content area starts after the watermark
  const contentStartY = 220;

  // Dashed divider (like the individual postcard)
  ctx.strokeStyle = collectionAccent;
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.moveTo(padding + 40, contentStartY);
  ctx.lineTo(padding + 140, contentStartY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Title
  ctx.fillStyle = collectionAccent;
  ctx.font = "bold 48px Georgia, serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(t("share.collectionTitle"), padding + 40, contentStartY + 20);

  // Progress count (large, centered)
  ctx.fillStyle = collectionAccent;
  ctx.font = "bold 80px Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText(
    `${earnedCount}/${totalCount}`,
    COLLECTION_WIDTH / 2,
    contentStartY + 90,
  );

  // Subtitle
  ctx.font = "28px Georgia, serif";
  ctx.globalAlpha = 0.8;
  ctx.fillText(
    t("share.collectionSubtitle"),
    COLLECTION_WIDTH / 2,
    contentStartY + 190,
  );
  ctx.globalAlpha = 1;

  // Grid layout: 6 columns × 9 rows (50 themes)
  const cols = 6;
  const gridPadding = 60;
  const gridGap = 12;
  const availableWidth = COLLECTION_WIDTH - gridPadding * 2;
  const cardWidth = Math.floor((availableWidth - (cols - 1) * gridGap) / cols);
  const cardHeight = Math.floor((cardWidth * 2) / 3);
  const labelFontSize = 12;
  const labelGap = 4;
  const rowGap = 10;
  const rowHeight = cardHeight + labelGap + labelFontSize + rowGap;

  const gridStartY = contentStartY + 260;
  const earnedSet = new Set(earnedThemes);

  THEME_ORDER.forEach((themeId, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const x = gridPadding + col * (cardWidth + gridGap);
    const y = gridStartY + row * rowHeight;
    const theme = THEMES[themeId];
    const isEarned = earnedSet.has(themeId);

    if (isEarned) {
      drawMiniPostcard(
        ctx,
        x,
        y,
        cardWidth,
        cardHeight,
        theme.gradient,
        theme.accent,
        theme.postcard.stamp,
      );
    } else {
      // Gray placeholder for unearned
      ctx.fillStyle = "#cbd5e1";
      drawRoundedRect(ctx, x, y, cardWidth, cardHeight, 8);
      ctx.fill();
    }

    // Theme name below card
    ctx.fillStyle = isEarned ? "#0f172a" : "#64748b";
    ctx.font = isEarned
      ? `bold ${labelFontSize}px sans-serif`
      : `${labelFontSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(
      t(`themes.${themeId}`),
      x + cardWidth / 2,
      y + cardHeight + labelGap,
    );
  });

  // Branding
  drawPostcardBranding(
    ctx,
    COLLECTION_WIDTH,
    COLLECTION_HEIGHT,
    collectionAccent,
    padding,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to generate image"));
      },
      "image/png",
      1,
    );
  });
}

export function canUseWebShare(): boolean {
  return (
    typeof navigator !== "undefined" &&
    !!navigator.share &&
    !!navigator.canShare
  );
}

export async function shareViaWebShare(
  title: string,
  text: string,
  imageBlob: Blob,
  filename: string,
): Promise<boolean> {
  if (!canUseWebShare()) return false;

  const file = new File([imageBlob], filename, { type: "image/png" });
  const shareData = { title, text, files: [file] };

  if (!navigator.canShare(shareData)) return false;

  try {
    await navigator.share(shareData);
    return true;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return true;
    }
    return false;
  }
}

export function downloadImage(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
