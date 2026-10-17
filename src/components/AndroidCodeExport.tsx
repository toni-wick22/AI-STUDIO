import React, { useState } from 'react';
import {
  Code,
  Copy,
  Check,
  Download,
  FileCode,
  Smartphone,
  ShieldCheck,
} from 'lucide-react';

const KOTLIN_GEOMETRY_ENGINE = `// CueGeometryEngine.kt
package com.cuegeometry.trainer.geometry

import kotlin.math.*

data class Vector2D(val x: Float, val y: Float) {
    operator fun plus(other: Vector2D) = Vector2D(x + other.x, y + other.y)
    operator fun minus(other: Vector2D) = Vector2D(x - other.x, y - other.y)
    operator fun times(scale: Float) = Vector2D(x * scale, y * scale)

    fun dot(other: Vector2D): Float = x * other.x + y * other.y
    fun cross2D(other: Vector2D): Float = x * other.y - y * other.x
    fun lengthSq(): Float = x * x + y * y
    fun length(): Float = sqrt(lengthSq())

    fun normalize(): Vector2D {
        val len = length()
        return if (len == 0f) Vector2D(0f, 0f) else Vector2D(x / len, y / len)
    }

    fun reflect(normal: Vector2D): Vector2D {
        val n = normal.normalize()
        val d = dot(n)
        return Vector2D(x - 2f * d * n.x, y - 2f * d * n.y)
    }
}

data class Ball(
    val id: Int,
    val position: Vector2D,
    val isCue: Boolean = false
)

data class Pocket(
    val id: String,
    val name: String,
    val position: Vector2D,
    val dropRadius: Float = 28f
)

object CueGeometryEngine {
    const val BALL_RADIUS = 14f
    const val TABLE_WIDTH = 1000f
    const val TABLE_HEIGHT = 500f
    const val CUSHION_WIDTH = 40f

    /**
     * Calculates Ghost-Ball position:
     * G = Target - (2 * R) * normalize(Pocket - Target)
     */
    fun calculateGhostBall(targetPos: Vector2D, destinationPos: Vector2D, radius: Float = BALL_RADIUS): Vector2D {
        val dir = (destinationPos - targetPos).normalize()
        return targetPos - (dir * (2f * radius))
    }

    /**
     * Calculates cut angle in degrees between cue approach and line of centers
     */
    fun calculateCutAngle(cuePos: Vector2D, ghostPos: Vector2D, targetPos: Vector2D): Float {
        val uCue = (ghostPos - cuePos).normalize()
        val uTarget = (targetPos - ghostPos).normalize()
        val dotVal = uCue.dot(uTarget).coerceIn(-1f, 1f)
        return (acos(dotVal) * 180f / PI.toFloat())
    }

    /**
     * Calculates the 90-degree stun tangent line
     */
    fun calculateTangentLine(
        cuePos: Vector2D,
        ghostPos: Vector2D,
        targetPos: Vector2D,
        length: Float = 200f
    ): Pair<Vector2D, Vector2D> {
        val cueToGhost = ghostPos - cuePos
        val ghostToTarget = targetPos - ghostPos
        val lineOfCenters = ghostToTarget.normalize()
        val cross = cueToGhost.cross2D(ghostToTarget)
        val sign = if (cross >= 0f) -1f else 1f
        val perp = Vector2D(sign * -lineOfCenters.y, sign * lineOfCenters.x)
        val end = ghostPos + (perp * length)
        return Pair(perp, end)
    }

    /**
     * 1-Cushion Bank calculation using mathematical mirror reflection
     */
    fun calculateOneCushionBank(
        targetPos: Vector2D,
        pocketPos: Vector2D,
        railY: Float = CUSHION_WIDTH
    ): Vector2D? {
        val virtualPocket = Vector2D(pocketPos.x, 2f * railY - pocketPos.y)
        val dy = virtualPocket.y - targetPos.y
        if (abs(dy) < 0.001f) return null
        val t = (railY - targetPos.y) / dy
        if (t <= 0f || t >= 1f) return null
        val bx = targetPos.x + t * (virtualPocket.x - targetPos.x)
        return Vector2D(bx, railY)
    }

    /**
     * Detects if obstacle ball intersects the shooting corridor
     */
    fun isPathObstructed(
        start: Vector2D,
        end: Vector2D,
        obstaclePos: Vector2D,
        corridorRadius: Float = BALL_RADIUS * 1.95f
    ): Boolean {
        val d = end - start
        val lenSq = d.lengthSq()
        if (lenSq == 0f) return false
        val f = obstaclePos - start
        val t = (f.dot(d) / lenSq).coerceIn(0f, 1f)
        val closest = start + (d * t)
        val distSq = (obstaclePos - closest).lengthSq()
        return distSq < (corridorRadius * corridorRadius)
    }
}
`;

const KOTLIN_VIEWMODEL = `// CueTrainerViewModel.kt
package com.cuegeometry.trainer.viewmodel

import androidx.lifecycle.ViewModel
import com.cuegeometry.trainer.geometry.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update

enum class ShotMode { DIRECT, BANK_1_CUSHION, BANK_2_CUSHION, KICK }

data class TrainerUiState(
    val balls: List<Ball> = listOf(
        Ball(0, Vector2D(250f, 250f), isCue = true),
        Ball(1, Vector2D(650f, 250f))
    ),
    val cueBallId: Int = 0,
    val targetBallId: Int = 1,
    val targetPocket: Pocket = Pocket("tr", "Top-Right", Vector2D(960f, 40f)),
    val shotMode: ShotMode = ShotMode.DIRECT,
    val ghostBallPos: Vector2D = Vector2D(0f, 0f),
    val cutAngleDeg: Float = 0f,
    val isBlocked: Boolean = false,
    val showTangentLine: Boolean = true
)

class CueTrainerViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(TrainerUiState())
    val uiState: StateFlow<TrainerUiState> = _uiState.asStateFlow()

    init {
        recalculateGeometry()
    }

    fun moveBall(ballId: Int, newPos: Vector2D) {
        val clamped = Vector2D(
            newPos.x.coerceIn(54f, 946f),
            newPos.y.coerceIn(54f, 446f)
        )
        _uiState.update { state ->
            state.copy(balls = state.balls.map { b ->
                if (b.id == ballId) b.copy(position = clamped) else b
            })
        }
        recalculateGeometry()
    }

    fun setShotMode(mode: ShotMode) {
        _uiState.update { it.copy(shotMode = mode) }
        recalculateGeometry()
    }

    private fun recalculateGeometry() {
        val state = _uiState.value
        val cue = state.balls.find { it.id == state.cueBallId } ?: return
        val target = state.balls.find { it.id == state.targetBallId } ?: return

        val ghost = CueGeometryEngine.calculateGhostBall(target.position, state.targetPocket.position)
        val cutAngle = CueGeometryEngine.calculateCutAngle(cue.position, ghost, target.position)

        val obstacle = state.balls.any { b ->
            b.id != cue.id && b.id != target.id &&
            CueGeometryEngine.isPathObstructed(cue.position, ghost, b.position)
        }

        _uiState.update { it.copy(
            ghostBallPos = ghost,
            cutAngleDeg = cutAngle,
            isBlocked = obstacle
        )}
    }
}
`;

const KOTLIN_CANVAS = `// TableCanvas.kt
package com.cuegeometry.trainer.ui

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.unit.dp
import com.cuegeometry.trainer.geometry.Vector2D
import com.cuegeometry.trainer.viewmodel.TrainerUiState

@Composable
fun TableCanvas(
    uiState: TrainerUiState,
    onMoveBall: (Int, Vector2D) -> Unit,
    modifier: Modifier = Modifier
) {
    var draggedBallId by remember { mutableStateOf<Int?>(null) }

    Canvas(
        modifier = modifier
            .fillMaxWidth()
            .aspectRatio(2f / 1f)
            .pointerInput(Unit) {
                detectDragGestures(
                    onDragStart = { offset ->
                        val hit = uiState.balls.find { b ->
                            val dx = b.position.x - offset.x
                            val dy = b.position.y - offset.y
                            (dx * dx + dy * dy) <= (20f * 20f)
                        }
                        draggedBallId = hit?.id
                    },
                    onDrag = { change, dragAmount ->
                        change.consume()
                        draggedBallId?.let { id ->
                            val current = uiState.balls.find { it.id == id }?.position ?: return@let
                            onMoveBall(id, current + Vector2D(dragAmount.x, dragAmount.y))
                        }
                    },
                    onDragEnd = { draggedBallId = null },
                    onDragCancel = { draggedBallId = null }
                )
            }
    ) {
        // 1. Draw Table Cloth (Classic Emerald)
        drawRect(color = Color(0xFF166534))

        // 2. Draw Aim Line (White)
        val cue = uiState.balls.find { it.id == uiState.cueBallId }?.position ?: Vector2D(0f, 0f)
        drawLine(
            color = if (uiState.isBlocked) Color(0xFFEF4444) else Color.White,
            start = Offset(cue.x, cue.y),
            end = Offset(uiState.ghostBallPos.x, uiState.ghostBallPos.y),
            strokeWidth = 4f
        )

        // 3. Draw Target Line (Yellow)
        val target = uiState.balls.find { it.id == uiState.targetBallId }?.position ?: Vector2D(0f, 0f)
        drawLine(
            color = Color(0xFFFACC15),
            start = Offset(target.x, target.y),
            end = Offset(uiState.targetPocket.position.x, uiState.targetPocket.position.y),
            strokeWidth = 4f
        )

        // 4. Draw Ghost Ball (Translucent Ring)
        drawCircle(
            color = Color(0xFF38BDF8).copy(alpha = 0.5f),
            radius = 14f,
            center = Offset(uiState.ghostBallPos.x, uiState.ghostBallPos.y)
        )

        // 5. Draw Balls
        uiState.balls.forEach { ball ->
            drawCircle(
                color = if (ball.isCue) Color.White else Color(0xFFEAB308),
                radius = 14f,
                center = Offset(ball.position.x, ball.position.y)
            )
        }
    }
}
`;

const ANDROID_MANIFEST = `<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <application
        android:theme="@style/Theme.CueGeometryTrainer"
        android:label="Cue Geometry Trainer"
        android:allowBackup="true"
        android:supportsRtl="true">

        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
`;

export const AndroidCodeExport: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'engine' | 'viewmodel' | 'canvas' | 'manifest'>('engine');
  const [copied, setCopied] = useState<boolean>(false);

  const getActiveCode = () => {
    switch (activeTab) {
      case 'engine':
        return { code: KOTLIN_GEOMETRY_ENGINE, filename: 'CueGeometryEngine.kt' };
      case 'viewmodel':
        return { code: KOTLIN_VIEWMODEL, filename: 'CueTrainerViewModel.kt' };
      case 'canvas':
        return { code: KOTLIN_CANVAS, filename: 'TableCanvas.kt' };
      case 'manifest':
        return { code: ANDROID_MANIFEST, filename: 'AndroidManifest.xml' };
    }
  };

  const { code, filename } = getActiveCode();

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-slate-100">
              Native Android (Kotlin + Jetpack Compose) Architecture
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Clean MVVM, StateFlow, Compose Canvas, Min SDK 26, 100% Google Play policy compliant.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy Code
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-lg shadow-emerald-950/40 transition"
          >
            <Download className="w-3.5 h-3.5" />
            Download {filename}
          </button>
        </div>
      </div>

      {/* Architecture Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {(
          [
            { id: 'engine', label: 'CueGeometryEngine.kt', icon: FileCode },
            { id: 'viewmodel', label: 'CueTrainerViewModel.kt', icon: FileCode },
            { id: 'canvas', label: 'TableCanvas.kt', icon: FileCode },
            { id: 'manifest', label: 'AndroidManifest.xml', icon: ShieldCheck },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold font-mono transition whitespace-nowrap ${
                isActive
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Code Editor Preview */}
      <div className="relative rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden font-mono text-xs">
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-slate-400 text-[11px]">
          <span>{filename}</span>
          <span className="text-emerald-400">Kotlin / Compose M3</span>
        </div>
        <pre className="p-4 text-slate-300 overflow-x-auto max-h-[480px] leading-relaxed">
          <code>{code}</code>
        </pre>
      </div>

      {/* Prohibited Permissions Audit Checklist */}
      <div className="bg-slate-950 border border-emerald-900/40 rounded-2xl p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <h4 className="text-xs font-bold text-slate-200">
            Strict Permission Policy Compliance Checklist (100% Excluded & Verified)
          </h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          {[
            { perm: 'SYSTEM_ALERT_WINDOW', desc: 'No display over other apps' },
            { perm: 'BIND_ACCESSIBILITY_SERVICE', desc: 'No input simulation' },
            { perm: 'QUERY_ALL_PACKAGES', desc: 'No app inspection' },
            { perm: 'READ_MEDIA_IMAGES', desc: 'No broad storage read' },
            { perm: 'READ_EXTERNAL_STORAGE', desc: 'No legacy storage read' },
            { perm: 'MANAGE_EXTERNAL_STORAGE', desc: 'No all-files access' },
            { perm: 'RECORD_AUDIO', desc: 'No microphone access' },
            { perm: 'CAMERA', desc: 'No camera access' },
          ].map((item) => (
            <div
              key={item.perm}
              className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 flex items-start gap-2"
            >
              <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                ✓
              </span>
              <div>
                <span className="font-mono text-[11px] font-bold text-rose-300 block line-through">
                  {item.perm}
                </span>
                <span className="text-[10px] text-slate-400">{item.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
