/**
 * Cue Geometry Engine
 * Standalone mathematical engine for billiards shot geometry.
 * Decoupled from UI rendering and framework dependencies.
 */

import { Vector2D, Ball, Pocket, GeometryCalculation, ShotType } from '../types';

// Table coordinate space: 1000 width x 500 height (2:1 regulation aspect ratio)
export const TABLE_WIDTH = 1000;
export const TABLE_HEIGHT = 500;
export const CUSHION_WIDTH = 40; // Rail cushion thickness
export const BALL_RADIUS = 14; // Billiards ball radius
export const POCKET_RADIUS = 28; // Corner & side pocket opening radius

// Playable area boundaries (nose of the cushions)
export const PLAYABLE_BOUNDS = {
  minX: CUSHION_WIDTH,
  maxX: TABLE_WIDTH - CUSHION_WIDTH,
  minY: CUSHION_WIDTH,
  maxY: TABLE_HEIGHT - CUSHION_WIDTH,
};

// Standard 6 Pockets on Regulation Billiard Table
export const STANDARD_POCKETS: Pocket[] = [
  {
    id: 'tl',
    name: 'Top-Left Corner',
    x: PLAYABLE_BOUNDS.minX,
    y: PLAYABLE_BOUNDS.minY,
    dropRadius: POCKET_RADIUS,
    normal: { x: Math.SQRT1_2, y: Math.SQRT1_2 },
    type: 'corner',
  },
  {
    id: 'tm',
    name: 'Top Side',
    x: TABLE_WIDTH / 2,
    y: PLAYABLE_BOUNDS.minY - 4,
    dropRadius: POCKET_RADIUS * 0.95,
    normal: { x: 0, y: 1 },
    type: 'side',
  },
  {
    id: 'tr',
    name: 'Top-Right Corner',
    x: PLAYABLE_BOUNDS.maxX,
    y: PLAYABLE_BOUNDS.minY,
    dropRadius: POCKET_RADIUS,
    normal: { x: -Math.SQRT1_2, y: Math.SQRT1_2 },
    type: 'corner',
  },
  {
    id: 'bl',
    name: 'Bottom-Left Corner',
    x: PLAYABLE_BOUNDS.minX,
    y: PLAYABLE_BOUNDS.maxY,
    dropRadius: POCKET_RADIUS,
    normal: { x: Math.SQRT1_2, y: -Math.SQRT1_2 },
    type: 'corner',
  },
  {
    id: 'bm',
    name: 'Bottom Side',
    x: TABLE_WIDTH / 2,
    y: PLAYABLE_BOUNDS.maxY + 4,
    dropRadius: POCKET_RADIUS * 0.95,
    normal: { x: 0, y: -1 },
    type: 'side',
  },
  {
    id: 'br',
    name: 'Bottom-Right Corner',
    x: PLAYABLE_BOUNDS.maxX,
    y: PLAYABLE_BOUNDS.maxY,
    dropRadius: POCKET_RADIUS,
    normal: { x: -Math.SQRT1_2, y: -Math.SQRT1_2 },
    type: 'corner',
  },
];

// ==========================================
// 1. Vector Operations
// ==========================================

export function vecAdd(a: Vector2D, b: Vector2D): Vector2D {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function vecSub(a: Vector2D, b: Vector2D): Vector2D {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function vecScale(v: Vector2D, s: number): Vector2D {
  return { x: v.x * s, y: v.y * s };
}

export function vecDot(a: Vector2D, b: Vector2D): number {
  return a.x * b.x + a.y * b.y;
}

export function vecCross2D(a: Vector2D, b: Vector2D): number {
  return a.x * b.y - a.y * b.x;
}

export function vecMagSq(v: Vector2D): number {
  return v.x * v.x + v.y * v.y;
}

export function vecMag(v: Vector2D): number {
  return Math.sqrt(vecMagSq(v));
}

export function vecDist(a: Vector2D, b: Vector2D): number {
  return vecMag(vecSub(a, b));
}

export function vecNorm(v: Vector2D): Vector2D {
  const m = vecMag(v);
  if (m === 0) return { x: 0, y: 0 };
  return { x: v.x / m, y: v.y / m };
}

export function vecReflect(v: Vector2D, normal: Vector2D): Vector2D {
  // R = V - 2 * (V . N) * N
  const n = vecNorm(normal);
  const d = vecDot(v, n);
  return {
    x: v.x - 2 * d * n.x,
    y: v.y - 2 * d * n.y,
  };
}

// Clamp coordinate strictly within playable table cloth
export function clampToTable(pos: Vector2D, radius = BALL_RADIUS): Vector2D {
  return {
    x: Math.max(PLAYABLE_BOUNDS.minX + radius, Math.min(PLAYABLE_BOUNDS.maxX - radius, pos.x)),
    y: Math.max(PLAYABLE_BOUNDS.minY + radius, Math.min(PLAYABLE_BOUNDS.maxY - radius, pos.y)),
  };
}

// ==========================================
// 2. Ghost-Ball Calculation
// ==========================================

/**
 * Calculates the exact ghost-ball position required to send the target ball to the pocket.
 * The ghost ball is tangent to the target ball along the target-to-pocket line.
 * Ghost Center = Target Center - (2 * BallRadius) * (Target-to-Pocket Unit Vector)
 */
export function calculateGhostBall(targetPos: Vector2D, destinationPos: Vector2D, radius = BALL_RADIUS): Vector2D {
  const targetToDest = vecSub(destinationPos, targetPos);
  const unitDir = vecNorm(targetToDest);
  return vecSub(targetPos, vecScale(unitDir, 2 * radius));
}

// ==========================================
// 3. Cut Angle & Fraction Analysis
// ==========================================

export function calculateCutAngle(cuePos: Vector2D, ghostPos: Vector2D, targetPos: Vector2D): number {
  const cueToGhost = vecSub(ghostPos, cuePos);
  const ghostToTarget = vecSub(targetPos, ghostPos);

  const uCue = vecNorm(cueToGhost);
  const uTarget = vecNorm(ghostToTarget);

  const dot = Math.max(-1, Math.min(1, vecDot(uCue, uTarget)));
  const angleRad = Math.acos(dot);
  return (angleRad * 180) / Math.PI;
}

export function getEffectiveFraction(cutAngleDeg: number): { label: string; fraction: number; difficulty: GeometryCalculation['difficulty'] } {
  const angle = Math.abs(cutAngleDeg);

  if (angle <= 4) {
    return { label: 'Full Ball (1.0)', fraction: 1.0, difficulty: 'Straight' };
  } else if (angle <= 20) {
    return { label: '3/4 Ball (~0.75)', fraction: 0.75, difficulty: 'Easy' };
  } else if (angle <= 35) {
    return { label: 'Half Ball (0.50 - 30°)', fraction: 0.5, difficulty: 'Moderate' };
  } else if (angle <= 55) {
    return { label: 'Quarter Ball (~0.25)', fraction: 0.25, difficulty: 'Challenging' };
  } else if (angle <= 75) {
    return { label: 'Thin Cut (~0.10)', fraction: 0.1, difficulty: 'Challenging' };
  } else {
    return { label: 'Extreme Cut (<5%)', fraction: 0.05, difficulty: 'Extreme Cut' };
  }
}

// ==========================================
// 4. Tangent Line (90° Stun Rule) & Follow Line (30° Rule)
// ==========================================

export function calculateTangentLine(
  cuePos: Vector2D,
  ghostPos: Vector2D,
  targetPos: Vector2D,
  lineLength = 250
): { dir: Vector2D; end: Vector2D } {
  const cueToGhost = vecSub(ghostPos, cuePos);
  const ghostToTarget = vecSub(targetPos, ghostPos);

  // Line of centers normal: from Ghost to Target
  const lineOfCenters = vecNorm(ghostToTarget);

  // Cross product determines if cut is to left or right
  const cross = vecCross2D(cueToGhost, ghostToTarget);

  // Perpendicular to line of centers
  // If target cuts right (cross > 0), cue ball deflects to left
  const sign = cross >= 0 ? -1 : 1;
  const perp: Vector2D = {
    x: sign * -lineOfCenters.y,
    y: sign * lineOfCenters.x,
  };

  return {
    dir: perp,
    end: vecAdd(ghostPos, vecScale(perp, lineLength)),
  };
}

export function calculateFollowLine(
  cuePos: Vector2D,
  ghostPos: Vector2D,
  targetPos: Vector2D,
  lineLength = 220
): { dir: Vector2D; end: Vector2D } {
  // Approximate natural rolling cue ball 30° rule:
  // For medium cut angles (around 30°), rolling cue ball deflects roughly 30° from original cue path
  const cueToGhost = vecNorm(vecSub(ghostPos, cuePos));
  const ghostToTarget = vecSub(targetPos, ghostPos);
  const cross = vecCross2D(cueToGhost, ghostToTarget);

  const deflectionAngleRad = (28 * Math.PI) / 180;
  const sign = cross >= 0 ? -1 : 1;

  // Rotate cueToGhost vector by deflectionAngle
  const cosA = Math.cos(sign * deflectionAngleRad);
  const sinA = Math.sin(sign * deflectionAngleRad);

  const followDir: Vector2D = {
    x: cueToGhost.x * cosA - cueToGhost.y * sinA,
    y: cueToGhost.x * sinA + cueToGhost.y * cosA,
  };

  return {
    dir: followDir,
    end: vecAdd(ghostPos, vecScale(followDir, lineLength)),
  };
}

// ==========================================
// 5. Ray-Circle Intersection & Obstructed Path Detection
// ==========================================

/**
 * Checks if a circular ball obstructs the path between segment start and end.
 * The corridor radius is the sum of traveling ball radius + obstacle ball radius (2 * BALL_RADIUS).
 */
export function isPathObstructed(
  start: Vector2D,
  end: Vector2D,
  obstaclePos: Vector2D,
  corridorRadius = BALL_RADIUS * 1.95
): boolean {
  const d = vecSub(end, start);
  const lenSq = vecMagSq(d);

  if (lenSq === 0) return false;

  // Projection parameter t of obstaclePos onto line segment [start, end]
  const f = vecSub(obstaclePos, start);
  const t = Math.max(0, Math.min(1, vecDot(f, d) / lenSq));

  // Closest point on the segment
  const closest = vecAdd(start, vecScale(d, t));
  const distSq = vecMagSq(vecSub(obstaclePos, closest));

  // Must be within corridor radius and strictly between the ends (not start/end itself)
  const isInsideCorridor = distSq < corridorRadius * corridorRadius;
  const isSeparatedFromEnds = vecDist(obstaclePos, start) > BALL_RADIUS * 1.1 && vecDist(obstaclePos, end) > BALL_RADIUS * 1.1;

  return isInsideCorridor && isSeparatedFromEnds;
}

export function findObstacleBall(
  start: Vector2D,
  end: Vector2D,
  balls: Ball[],
  excludedIds: number[]
): Ball | null {
  for (const ball of balls) {
    if (excludedIds.includes(ball.id)) continue;
    if (isPathObstructed(start, end, ball)) {
      return ball;
    }
  }
  return null;
}

// ==========================================
// 6. Bank Shot & Kick Shot Mirror Geometry
// ==========================================

/**
 * Calculates 1-cushion bank shot geometry using mathematical mirror reflection.
 * Mirrors the pocket across the cushion line, then intersects line (Target -> Virtual Pocket) with the cushion rail.
 */
export function calculateOneCushionBank(
  targetPos: Vector2D,
  pocket: Pocket,
  preferredRail?: 'top' | 'bottom' | 'left' | 'right'
): { bouncePoint: Vector2D; virtualPocket: Vector2D; rail: string } | null {
  // Determine the best cushion rail to bounce from based on pocket position and target position
  const rails: ('top' | 'bottom' | 'left' | 'right')[] = preferredRail
    ? [preferredRail]
    : ['top', 'bottom', 'left', 'right'];

  for (const rail of rails) {
    let virtualPocket: Vector2D;
    let bouncePoint: Vector2D | null = null;

    if (rail === 'top') {
      const railY = PLAYABLE_BOUNDS.minY;
      virtualPocket = { x: pocket.x, y: 2 * railY - pocket.y };
      // Intersect line Target -> VirtualPocket with y = railY
      const dy = virtualPocket.y - targetPos.y;
      if (Math.abs(dy) > 0.001) {
        const t = (railY - targetPos.y) / dy;
        if (t > 0 && t < 1) {
          const bx = targetPos.x + t * (virtualPocket.x - targetPos.x);
          if (bx >= PLAYABLE_BOUNDS.minX && bx <= PLAYABLE_BOUNDS.maxX) {
            bouncePoint = { x: bx, y: railY };
          }
        }
      }
    } else if (rail === 'bottom') {
      const railY = PLAYABLE_BOUNDS.maxY;
      virtualPocket = { x: pocket.x, y: 2 * railY - pocket.y };
      const dy = virtualPocket.y - targetPos.y;
      if (Math.abs(dy) > 0.001) {
        const t = (railY - targetPos.y) / dy;
        if (t > 0 && t < 1) {
          const bx = targetPos.x + t * (virtualPocket.x - targetPos.x);
          if (bx >= PLAYABLE_BOUNDS.minX && bx <= PLAYABLE_BOUNDS.maxX) {
            bouncePoint = { x: bx, y: railY };
          }
        }
      }
    } else if (rail === 'left') {
      const railX = PLAYABLE_BOUNDS.minX;
      virtualPocket = { x: 2 * railX - pocket.x, y: pocket.y };
      const dx = virtualPocket.x - targetPos.x;
      if (Math.abs(dx) > 0.001) {
        const t = (railX - targetPos.x) / dx;
        if (t > 0 && t < 1) {
          const by = targetPos.y + t * (virtualPocket.y - targetPos.y);
          if (by >= PLAYABLE_BOUNDS.minY && by <= PLAYABLE_BOUNDS.maxY) {
            bouncePoint = { x: railX, y: by };
          }
        }
      }
    } else {
      const railX = PLAYABLE_BOUNDS.maxX;
      virtualPocket = { x: 2 * railX - pocket.x, y: pocket.y };
      const dx = virtualPocket.x - targetPos.x;
      if (Math.abs(dx) > 0.001) {
        const t = (railX - targetPos.x) / dx;
        if (t > 0 && t < 1) {
          const by = targetPos.y + t * (virtualPocket.y - targetPos.y);
          if (by >= PLAYABLE_BOUNDS.minY && by <= PLAYABLE_BOUNDS.maxY) {
            bouncePoint = { x: railX, y: by };
          }
        }
      }
    }

    if (bouncePoint && virtualPocket) {
      return { bouncePoint, virtualPocket, rail };
    }
  }

  return null;
}

/**
 * Calculates 2-cushion bank shot geometry using double mirror reflection.
 */
export function calculateTwoCushionBank(
  targetPos: Vector2D,
  pocket: Pocket
): { bouncePoints: Vector2D[]; virtualPockets: Vector2D[] } | null {
  // Typical two-cushion bank: Rail 1 (Top/Bottom) then Rail 2 (Left/Right)
  // Mirror across Rail 2 then Rail 1
  const rail1Y = targetPos.y < TABLE_HEIGHT / 2 ? PLAYABLE_BOUNDS.minY : PLAYABLE_BOUNDS.maxY;
  const rail2X = pocket.x < TABLE_WIDTH / 2 ? PLAYABLE_BOUNDS.minX : PLAYABLE_BOUNDS.maxX;

  // Mirror pocket across Rail 2
  const vP2: Vector2D = { x: 2 * rail2X - pocket.x, y: pocket.y };
  // Mirror vP2 across Rail 1
  const vP1: Vector2D = { x: vP2.x, y: 2 * rail1Y - vP2.y };

  // Aim point 1: line from targetPos to vP1 intersected with Rail 1
  const dy1 = vP1.y - targetPos.y;
  if (Math.abs(dy1) < 0.001) return null;
  const t1 = (rail1Y - targetPos.y) / dy1;
  if (t1 <= 0 || t1 >= 1) return null;
  const b1: Vector2D = {
    x: targetPos.x + t1 * (vP1.x - targetPos.x),
    y: rail1Y,
  };

  // Aim point 2: line from b1 to vP2 intersected with Rail 2
  const dx2 = vP2.x - b1.x;
  if (Math.abs(dx2) < 0.001) return null;
  const t2 = (rail2X - b1.x) / dx2;
  if (t2 <= 0 || t2 >= 1) return null;
  const b2: Vector2D = {
    x: rail2X,
    y: b1.y + t2 * (vP2.y - b1.y),
  };

  return {
    bouncePoints: [b1, b2],
    virtualPockets: [vP1, vP2],
  };
}

/**
 * Calculates kick shot geometry:
 * Cue ball bounces off cushion first to hit target ball at ghost ball position.
 */
export function calculateKickShot(
  cuePos: Vector2D,
  ghostPos: Vector2D
): { bouncePoint: Vector2D; virtualGhost: Vector2D; rail: string } | null {
  // Try rails based on relative positions
  const rails: ('top' | 'bottom' | 'left' | 'right')[] = ['top', 'bottom', 'left', 'right'];

  for (const rail of rails) {
    let virtualGhost: Vector2D;
    let bouncePoint: Vector2D | null = null;

    if (rail === 'top') {
      const railY = PLAYABLE_BOUNDS.minY;
      virtualGhost = { x: ghostPos.x, y: 2 * railY - ghostPos.y };
      const dy = virtualGhost.y - cuePos.y;
      if (Math.abs(dy) > 0.001) {
        const t = (railY - cuePos.y) / dy;
        if (t > 0 && t < 1) {
          const bx = cuePos.x + t * (virtualGhost.x - cuePos.x);
          if (bx >= PLAYABLE_BOUNDS.minX && bx <= PLAYABLE_BOUNDS.maxX) {
            bouncePoint = { x: bx, y: railY };
          }
        }
      }
    } else if (rail === 'bottom') {
      const railY = PLAYABLE_BOUNDS.maxY;
      virtualGhost = { x: ghostPos.x, y: 2 * railY - ghostPos.y };
      const dy = virtualGhost.y - cuePos.y;
      if (Math.abs(dy) > 0.001) {
        const t = (railY - cuePos.y) / dy;
        if (t > 0 && t < 1) {
          const bx = cuePos.x + t * (virtualGhost.x - cuePos.x);
          if (bx >= PLAYABLE_BOUNDS.minX && bx <= PLAYABLE_BOUNDS.maxX) {
            bouncePoint = { x: bx, y: railY };
          }
        }
      }
    } else if (rail === 'left') {
      const railX = PLAYABLE_BOUNDS.minX;
      virtualGhost = { x: 2 * railX - ghostPos.x, y: ghostPos.y };
      const dx = virtualGhost.x - cuePos.x;
      if (Math.abs(dx) > 0.001) {
        const t = (railX - cuePos.x) / dx;
        if (t > 0 && t < 1) {
          const by = cuePos.y + t * (virtualGhost.y - cuePos.y);
          if (by >= PLAYABLE_BOUNDS.minY && by <= PLAYABLE_BOUNDS.maxY) {
            bouncePoint = { x: railX, y: by };
          }
        }
      }
    } else {
      const railX = PLAYABLE_BOUNDS.maxX;
      virtualGhost = { x: 2 * railX - ghostPos.x, y: ghostPos.y };
      const dx = virtualGhost.x - cuePos.x;
      if (Math.abs(dx) > 0.001) {
        const t = (railX - cuePos.x) / dx;
        if (t > 0 && t < 1) {
          const by = cuePos.y + t * (virtualGhost.y - cuePos.y);
          if (by >= PLAYABLE_BOUNDS.minY && by <= PLAYABLE_BOUNDS.maxY) {
            bouncePoint = { x: railX, y: by };
          }
        }
      }
    }

    if (bouncePoint && virtualGhost) {
      return { bouncePoint, virtualGhost, rail };
    }
  }

  return null;
}

// ==========================================
// 7. Complete Full Geometry Computation
// ==========================================

export function computeShotGeometry(
  cueBall: Ball,
  targetBall: Ball,
  pocket: Pocket,
  otherBalls: Ball[],
  shotType: ShotType = 'direct'
): GeometryCalculation {
  const cuePos = { x: cueBall.x, y: cueBall.y };
  const targetPos = { x: targetBall.x, y: targetBall.y };
  const pocketPos = { x: pocket.x, y: pocket.y };

  let destinationForTarget = pocketPos;
  let cushionBouncePoints: Vector2D[] = [];
  let reflectionLegs: { from: Vector2D; to: Vector2D; isBlocked?: boolean }[] = [];

  if (shotType === 'bank_1') {
    const bank = calculateOneCushionBank(targetPos, pocket);
    if (bank) {
      destinationForTarget = bank.bouncePoint;
      cushionBouncePoints = [bank.bouncePoint];
      reflectionLegs = [
        { from: targetPos, to: bank.bouncePoint },
        { from: bank.bouncePoint, to: pocketPos },
      ];
    }
  } else if (shotType === 'bank_2') {
    const bank2 = calculateTwoCushionBank(targetPos, pocket);
    if (bank2 && bank2.bouncePoints.length === 2) {
      destinationForTarget = bank2.bouncePoints[0];
      cushionBouncePoints = bank2.bouncePoints;
      reflectionLegs = [
        { from: targetPos, to: bank2.bouncePoints[0] },
        { from: bank2.bouncePoints[0], to: bank2.bouncePoints[1] },
        { from: bank2.bouncePoints[1], to: pocketPos },
      ];
    }
  }

  // Ghost ball is placed relative to where the target ball must head
  const ghostBallPos = calculateGhostBall(targetPos, destinationForTarget);

  let aimOrigin = cuePos;
  if (shotType === 'kick') {
    const kick = calculateKickShot(cuePos, ghostBallPos);
    if (kick) {
      aimOrigin = kick.bouncePoint;
      cushionBouncePoints = [kick.bouncePoint];
      reflectionLegs = [
        { from: cuePos, to: kick.bouncePoint },
        { from: kick.bouncePoint, to: ghostBallPos },
      ];
    }
  }

  const cueToGhostDir = vecNorm(vecSub(ghostBallPos, aimOrigin));
  const targetToPocketDir = vecNorm(vecSub(destinationForTarget, targetPos));

  const cutAngleDeg = calculateCutAngle(aimOrigin, ghostBallPos, targetPos);
  const { label: effectiveFraction, fraction: fractionValue, difficulty } = getEffectiveFraction(cutAngleDeg);

  const tangent = calculateTangentLine(aimOrigin, ghostBallPos, targetPos);
  const follow = calculateFollowLine(aimOrigin, ghostBallPos, targetPos);

  // Extended aim line past ghost ball
  const extendedAimEnd = vecAdd(ghostBallPos, vecScale(cueToGhostDir, 260));

  // Check obstacle collisions
  const excludedIds = [cueBall.id, targetBall.id];
  let isBlocked = false;
  let blockedByBallId: number | undefined;
  let blockedSegment: GeometryCalculation['blockedSegment'];

  // Check cue to ghost corridor
  if (shotType === 'kick' && cushionBouncePoints.length > 0) {
    const obst1 = findObstacleBall(cuePos, cushionBouncePoints[0], otherBalls, excludedIds);
    const obst2 = findObstacleBall(cushionBouncePoints[0], ghostBallPos, otherBalls, excludedIds);
    if (obst1) {
      isBlocked = true;
      blockedByBallId = obst1.id;
      blockedSegment = 'cushion-leg';
    } else if (obst2) {
      isBlocked = true;
      blockedByBallId = obst2.id;
      blockedSegment = 'cue-to-ghost';
    }
  } else {
    const obstCue = findObstacleBall(cuePos, ghostBallPos, otherBalls, excludedIds);
    if (obstCue) {
      isBlocked = true;
      blockedByBallId = obstCue.id;
      blockedSegment = 'cue-to-ghost';
    }
  }

  // Check target ball path to destination
  if (!isBlocked) {
    if (cushionBouncePoints.length > 0 && shotType.startsWith('bank')) {
      for (let i = 0; i < reflectionLegs.length; i++) {
        const leg = reflectionLegs[i];
        const obstLeg = findObstacleBall(leg.from, leg.to, otherBalls, excludedIds);
        if (obstLeg) {
          isBlocked = true;
          blockedByBallId = obstLeg.id;
          blockedSegment = 'cushion-leg';
          leg.isBlocked = true;
          break;
        }
      }
    } else {
      const obstTarget = findObstacleBall(targetPos, pocketPos, otherBalls, excludedIds);
      if (obstTarget) {
        isBlocked = true;
        blockedByBallId = obstTarget.id;
        blockedSegment = 'target-to-pocket';
      }
    }
  }

  // Pocket margin of error: effective pocket opening angle from target ball
  const distToPocket = vecDist(targetPos, pocketPos);
  const effectivePocketWidth = pocket.dropRadius * 1.6;
  const marginRad = 2 * Math.atan((effectivePocketWidth / 2) / Math.max(1, distToPocket));
  const marginOfErrorDeg = (marginRad * 180) / Math.PI;

  return {
    cuePos,
    targetPos,
    targetPocket: pocket,
    ghostBallPos,
    cueToGhostDir,
    targetToPocketDir,
    cutAngleDeg,
    effectiveFraction,
    fractionValue,
    tangentDir: tangent.dir,
    tangentEnd: tangent.end,
    followDir: follow.dir,
    followEnd: follow.end,
    extendedAimEnd,
    isBlocked,
    blockedByBallId,
    blockedSegment,
    shotDistanceTableUnits: Math.round(vecDist(cuePos, ghostBallPos)),
    targetDistanceTableUnits: Math.round(vecDist(targetPos, destinationForTarget)),
    difficulty,
    cushionBouncePoints,
    reflectionLegs,
    marginOfErrorDeg: Number(marginOfErrorDeg.toFixed(1)),
  };
}
