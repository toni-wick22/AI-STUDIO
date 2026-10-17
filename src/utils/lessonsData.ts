import { Lesson } from '../types';

export const LESSONS_DATA: Lesson[] = [
  {
    id: 'lesson-ghost-ball',
    title: 'Direct Shots & The Ghost-Ball Method',
    subtitle: 'The cornerstone technique of all competitive billiards aiming',
    difficulty: 'Beginner',
    durationMinutes: 5,
    conceptSummary:
      'To pocket any object ball, the cue ball must not aim at the object ball itself, but at the exact spot where the cue ball would rest if it were touching the object ball in line with the pocket.',
    keyRule:
      'Ghost Ball Center = Object Ball Center - (2 × Ball Radius) along the line to the pocket.',
    detailedText: [
      'In billiards, momentum is transferred strictly along the line connecting the centers of the two balls at the microsecond of impact (the "Line of Centers").',
      'Because balls have physical dimension (approx. 2.25 inches or 57.15mm diameter), aiming directly at the object ball center causes it to travel off-line.',
      'The "Ghost Ball" is an imaginary sphere frozen in space right behind the target ball, pointing directly into the center of the pocket mouth.',
      'When your cue ball center arrives at the ghost ball center, the impact sends the object ball directly down the target line every single time.',
    ],
    setupCue: { x: 300, y: 250 },
    setupTarget: { x: 650, y: 250 },
    setupPocketId: 'tr', // Top-Right Corner
    shotType: 'direct',
    quizTip:
      'Look for the white ghost ring on the table. Aim your cue stick directly through the center of that ghost ring!',
  },
  {
    id: 'lesson-cut-angles',
    title: 'Cut Angles & Ball-Fraction Aiming',
    subtitle: 'How to aim 15°, 30°, 45°, and 60° cut shots using ball overlaps',
    difficulty: 'Beginner',
    durationMinutes: 8,
    conceptSummary:
      'When the cue ball and target ball are not aligned straight with the pocket, the shot requires a "cut". We classify shots by the fraction of the ball diameter that overlaps at impact.',
    keyRule:
      'Half-Ball Cut is precisely 30.0°. Aiming the cue center at the target ball edge produces a 30° cut angle!',
    detailedText: [
      'The cut angle is the angle between the incoming cue ball path and the line of centers to the pocket.',
      'Full Ball (0° to 4°): Direct head-on hit. 100% forward energy transferred to the object ball.',
      'Three-Quarter Ball (~14° to 20°): The cue center aims roughly halfway between the object ball center and its edge.',
      'Half-Ball (30.0°): The gold standard of aiming systems. Aim the tip of your cue at the outer edge of the object ball. Because the cue ball has radius R and the contact distance is 2R, sin(θ) = R / (2R) = 0.5 → θ = 30° exactly!',
      'Quarter-Ball (~48°): The cue center aims half a ball-width outside the object ball.',
      'Thin Cut (60° to 80°): Only a sliver of the cue ball clips the edge. Requires gentle stroke to prevent throw.',
    ],
    setupCue: { x: 400, y: 360 },
    setupTarget: { x: 620, y: 200 },
    setupPocketId: 'tr',
    shotType: 'direct',
    quizTip:
      'Check the Cut Angle HUD in the simulator. Notice how the visual ball overlap indicator shifts as you drag the cue ball around!',
  },
  {
    id: 'lesson-tangent-line',
    title: 'The 90-Degree Tangent Line Rule',
    subtitle: 'Predicting cue ball deflection on stun shots to control the table',
    difficulty: 'Intermediate',
    durationMinutes: 7,
    conceptSummary:
      'On any sliding or stun shot (no forward or backward roll at impact), the cue ball ALWAYS leaves the object ball at exactly a 90-degree angle to the object ball’s path.',
    keyRule:
      'Stun Rule: Object Ball Path ⊥ Cue Ball Deflection Path (90° Angle of Separation).',
    detailedText: [
      'The 90-Degree Rule is the most reliable positional secret used by professional billiards players.',
      'When the cue ball has zero top spin and zero back spin at contact (a "sliding" or "stun" hit), all forward energy along the line of centers transfers to the object ball.',
      'The cue ball’s remaining momentum is strictly perpendicular to the line of centers. It shoots out along the "Tangent Line".',
      'Use this rule to predict cue ball scratches into pockets and to navigate through clusters of opposing balls without guessing.',
    ],
    setupCue: { x: 380, y: 320 },
    setupTarget: { x: 600, y: 250 },
    setupPocketId: 'tm', // Top Middle Side Pocket
    shotType: 'direct',
    quizTip:
      'Look at the cyan/purple dashed line extending from the ghost ball. That is the exact track your cue ball will follow after impact!',
  },
  {
    id: 'lesson-bank-mirror',
    title: 'Bank Shots & The Diamond Mirror System',
    subtitle: 'Using geometric reflection to sink shots off the cushions',
    difficulty: 'Intermediate',
    durationMinutes: 9,
    conceptSummary:
      'A bank shot rebounds the object ball off one or more cushions into a pocket. In ideal geometry, the angle of incidence equals the angle of reflection.',
    keyRule:
      'Mirror Rule: Aim the target ball at a "Virtual Pocket" mirrored equidistant behind the cushion rail.',
    detailedText: [
      'To find the exact bounce point on the cushion, imagine the pocket reflected behind the rail as if in a mirror.',
      'Draw an imaginary straight line from the target ball to that virtual pocket. The point where this line intersects the cushion nose is your precise aim point!',
      'On regulation tables, the rail diamonds provide integer markings that divide the table length into 8 segments and width into 4 segments.',
      'Educational Note: On real felt tables, speed and cushion elasticity introduce slight "cushion compression" and "throw". Always test at medium speed.',
    ],
    setupCue: { x: 450, y: 350 },
    setupTarget: { x: 650, y: 320 },
    setupPocketId: 'tl', // Bank into Top-Left
    shotType: 'bank_1',
    quizTip:
      'Notice the amber diamond on the top rail in the simulator. The target ball will strike that rail point and reflect cleanly into the corner pocket!',
  },
  {
    id: 'lesson-kick-shots',
    title: 'Kick Shots & Escaping Snookers',
    subtitle: 'Rebounding the cue ball off cushions when your direct line is blocked',
    difficulty: 'Advanced',
    durationMinutes: 10,
    conceptSummary:
      'When an opponent ball blocks your direct path to the target ball, a kick shot routes the cue ball off one or more cushions to reach the ghost ball.',
    keyRule:
      'Kick Aim: Mirror the ghost ball across the chosen rail, then aim your cue ball directly at that reflection point.',
    detailedText: [
      'Kick shots are defensive and offensive lifesavers in 8-ball and 9-ball when snookered behind opposing balls.',
      'The principle is identical to bank shots, but applied to the cue ball: the cue ball reflects off the cushion to hit the ghost-ball coordinates.',
      'Pay close attention to cue speed: striking the cushion at high speed compresses the rubber rubber nose, steepening the rebound angle slightly.',
      'Our educational engine models the pure mathematical reflection so you can master the foundational geometry first.',
    ],
    setupCue: { x: 300, y: 380 },
    setupTarget: { x: 680, y: 180 },
    setupPocketId: 'br',
    shotType: 'kick',
    quizTip:
      'Drag the obstacle ball into the simulator and see how the red warning line alerts you if any ball blocks the rail escape corridor!',
  },
];
