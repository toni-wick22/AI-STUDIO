/**
 * Cue Geometry Trainer - Core Type Definitions
 */

export interface Vector2D {
  x: number;
  y: number;
}

export interface Ball {
  id: number; // 0 = Cue Ball, 1-15 = Object Balls
  x: number;
  y: number;
  isCue?: boolean;
}

export type ShotType = 'direct' | 'bank_1' | 'bank_2' | 'kick';

export interface Pocket {
  id: string;
  name: string;
  x: number;
  y: number;
  dropRadius: number;
  normal: Vector2D; // Inward facing vector for angle of approach
  type: 'corner' | 'side';
}

export interface VisualSettings {
  showGhostBall: boolean;
  showAimLine: boolean;
  showTargetLine: boolean;
  showTangentLine: boolean;
  showFollowLine: boolean;
  showExtendedAim: boolean;
  showDiamondGrid: boolean;
  threeLineMode: boolean;
  lineThickness: number; // 1 to 6
  aimLineColor: string;
  targetLineColor: string;
  tangentLineColor: string;
  followLineColor: string;
  blockedLineColor: string;
  tableClothColor: 'classic-green' | 'tournament-blue' | 'charcoal-grey' | 'burgundy-red';
}

export interface GeometryCalculation {
  cuePos: Vector2D;
  targetPos: Vector2D;
  targetPocket: Pocket;
  ghostBallPos: Vector2D;
  cueToGhostDir: Vector2D;
  targetToPocketDir: Vector2D;
  cutAngleDeg: number;
  effectiveFraction: string;
  fractionValue: number;
  tangentDir: Vector2D;
  tangentEnd: Vector2D;
  followDir: Vector2D;
  followEnd: Vector2D;
  extendedAimEnd: Vector2D;
  isBlocked: boolean;
  blockedByBallId?: number;
  blockedSegment?: 'cue-to-ghost' | 'target-to-pocket' | 'cushion-leg';
  shotDistanceTableUnits: number;
  targetDistanceTableUnits: number;
  difficulty: 'Straight' | 'Easy' | 'Moderate' | 'Challenging' | 'Extreme Cut';
  cushionBouncePoints?: Vector2D[];
  reflectionLegs?: { from: Vector2D; to: Vector2D; isBlocked?: boolean }[];
  marginOfErrorDeg: number;
}

export interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  durationMinutes: number;
  conceptSummary: string;
  keyRule: string;
  detailedText: string[];
  setupCue: Vector2D;
  setupTarget: Vector2D;
  setupPocketId: string;
  otherBalls?: Ball[];
  shotType: ShotType;
  quizTip: string;
}

export interface UnitTestResult {
  id: string;
  category: 'Vector' | 'GhostBall' | 'CutAngle' | 'Collision' | 'Reflection' | 'UI';
  name: string;
  description: string;
  passed: boolean;
  executionTimeMs: number;
  expected: string;
  actual: string;
  details?: string;
}
