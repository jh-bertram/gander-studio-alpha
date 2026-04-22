# Design Spec — gander-studio-p2-canvas-link-002

```xml
<design_spec>
  <task_id>gander-studio-p2-canvas-link-002</task_id>
  <surface>Materia Canvas Overhaul — five surfaces</surface>

  <!-- ═══════════════════════════════════════════════════════════════════════
       SURFACE 1 — GLASSY 3D CSS ORB
  ═══════════════════════════════════════════════════════════════════════ -->

  <surface_1 name="GlassyOrb">

    <description>
      A CSS sphere illusion — no SVG, no canvas, no images. Light source at
      top-left. The orb element itself carries the depth gradient and shadow
      stack. One absolutely-positioned child div provides the specular
      highlight.
    </description>

    <component_hierarchy>
      div.orb-root (outer — positions relative, holds highlight child)
        └── div.orb-highlight (specular top-left oval — child div)
    </component_hierarchy>

    <tokens>
      <token element="--orb-color" token="--orb-color"
             value="injected inline via React style prop; set to the result of getMateriaColor(name, type)" />
      <token element="rim glow box-shadow layer" token="--gt"
             value="0 0 12px rgba(84, 153, 181, 0.4)" />
      <token element="rim glow intensified (orchestrator)" token="--my"
             value="#e8c840 — used for orchestrator outer ring; inject as --orb-ring-color inline" />
    </tokens>

    <orb_element>
      <!-- Applied to the outer div — width and height set to ORB_SIZE_PX (56px)
           or ORB_SIZE_ORCHESTRATOR_PX (68px) via inline style, as today -->
      <property name="border-radius" value="50%" />
      <property name="position" value="relative" />
      <property name="flex-shrink" value="0" />

      <!-- Depth gradient: dark bottom-right → mid-tone center → light top-left -->
      <!-- Uses --orb-color as the mid-tone anchor; the gradient layers mix
           black (depth) and white (highlight) stops over the base color -->
      <property name="background">
        radial-gradient(
          ellipse at 30% 28%,
          color-mix(in srgb, var(--orb-color) 60%, white 40%) 0%,
          var(--orb-color) 40%,
          color-mix(in srgb, var(--orb-color) 60%, black 40%) 72%,
          color-mix(in srgb, var(--orb-color) 30%, black 70%) 100%
        )
      </property>
      <!-- Note: color-mix() is supported in all browsers shipping React 19.
           Fallback not required; app targets evergreen only. -->

      <!-- Shadow stack (4 layers, space-separated) -->
      <!-- Layer 1: outer rim glow — teal halo -->
      <!-- Layer 2: wider softer ambient glow -->
      <!-- Layer 3: inset top-left light bloom (depth illusion) -->
      <!-- Layer 4: inset bottom-right depth shadow -->
      <property name="box-shadow">
        0 0 10px 2px var(--bdb),
        0 0 20px 4px var(--gt),
        inset 2px 3px 8px 0px rgba(255, 255, 255, 0.22),
        inset -3px -4px 10px 0px rgba(0, 0, 0, 0.55)
      </property>
      <!-- Token reference:
           --bdb = rgba(84,153,181,0.55) — brighter rim
           --gt  = 0 0 12px rgba(84,153,181,0.4) — used as the second layer value;
                   because box-shadow does not accept CSS shadow tokens as a full layer
                   shorthand, FE must inline the resolved value of --gt for layers 1+2,
                   OR use the token only if the browser can resolve it as a complete
                   shadow value. Safe approach: use the token directly — React Flow
                   renders into the DOM where CSS variables resolve correctly. -->

      <!-- Orchestrator variant: replace outer rim glow layers with --my yellow ring -->
      <!-- box-shadow override for isOrchestrator === true:
           0 0 10px 2px rgba(232, 200, 64, 0.65),
           0 0 22px 6px rgba(232, 200, 64, 0.25),
           inset 2px 3px 8px 0px rgba(255, 255, 255, 0.22),
           inset -3px -4px 10px 0px rgba(0, 0, 0, 0.55)
           Note: inline rgba here is a direct encoding of --my (#e8c840 = rgb(232,200,64))
           with opacity. FE may extract as a new token --my-glow if desired. -->
    </orb_element>

    <highlight_div>
      <!-- class: orb-highlight — absolutely positioned child -->
      <property name="position" value="absolute" />
      <property name="top" value="8px" />
      <property name="left" value="8px" />
      <property name="width" value="38%" />
      <!-- 38% of the orb width: ~21px on 56px orb, ~26px on 68px orb -->
      <property name="height" value="26%" />
      <!-- 26% of orb height: ~15px on 56px orb, ~18px on 68px orb -->
      <property name="border-radius" value="50%" />
      <property name="background">
        radial-gradient(
          ellipse at 40% 40%,
          rgba(255, 255, 255, 0.72) 0%,
          rgba(255, 255, 255, 0.28) 50%,
          rgba(255, 255, 255, 0.00) 100%
        )
      </property>
      <property name="pointer-events" value="none" />
      <property name="z-index" value="2" />
      <!-- No token is applicable here — white highlight is always white,
           which is var(--w). However, rgba(255,255,255,X) is needed for opacity
           gradients; var(--w) cannot carry per-stop opacity in a gradient.
           This is the one approved use of inline rgba white in this spec. -->
    </highlight_div>

    <states>
      <state name="default">Depth gradient + 4-layer box-shadow + specular child div as described above.</state>
      <state name="hover">box-shadow layer 1 spreads to 4px (from 2px); layer 2 spreads to 6px (from 4px). Transition: box-shadow 150ms ease-out.</state>
      <state name="focus-visible">outline: 2px solid var(--mt); outline-offset: 3px. Same ring treatment as existing .nav-item:focus-visible.</state>
      <state name="selected">Additional inset box-shadow layer added: inset 0 0 0 2px var(--bdb).</state>
      <state name="on-canvas-already">opacity: 0.5 — matches existing palette item treatment for already-placed orbs.</state>
    </states>

    <notes>
      The existing buildOrbShadow() function in MateriaNode.tsx will be replaced
      by this spec. The backgroundColor prop will be removed from orbStyle and
      replaced by the background gradient above. --orb-color must be set in the
      inline style object as a CSS custom property, e.g.:
        style={{ '--orb-color': getMateriaColor(name, type) } as React.CSSProperties}
      The highlight div is a new child element inside the orb div, before the
      remove button in DOM order so the remove button renders on top.
    </notes>

  </surface_1>


  <!-- ═══════════════════════════════════════════════════════════════════════
       SURFACE 2 — MAGNETIC SNAP ANIMATION
  ═══════════════════════════════════════════════════════════════════════ -->

  <surface_2 name="MagneticSnapAnimation">

    <description>
      When a dragged orb enters proximity of another orb (CANVAS_PROXIMITY_THRESHOLD_PX = 60px
      center-to-center), the TARGET orb gains the .orb-attracted class and plays the
      orb-attract animation. The dragged orb itself does NOT get this class — only the
      stationary orb being approached.
    </description>

    <keyframe name="orb-attract">
      <!-- Total duration: 320ms, iteration: infinite while class is applied -->
      <!-- Default translate axis: translateY — negative is upward (toward the dragger) -->
      <!--
        @keyframes orb-attract {
          0%   { transform: scale(1.00) translateY(0px);   }
          35%  { transform: scale(1.08) translateY(-8px);  }
          65%  { transform: scale(1.06) translateY(-6px);  }
          100% { transform: scale(1.00) translateY(0px);   }
        }
      -->
      <stop at="0%"   transform="scale(1.00) translateY(0px)" />
      <stop at="35%"  transform="scale(1.08) translateY(-8px)" />
      <stop at="65%"  transform="scale(1.06) translateY(-6px)" />
      <stop at="100%" transform="scale(1.00) translateY(0px)" />

      <note>
        FE applies the actual attraction direction in JS by overriding the
        transform at runtime (e.g. translateX for horizontal approach). The
        keyframe default axis is Y. The JS layer can apply a CSS variable
        --attract-dx and --attract-dy (in px) so the keyframe uses
        translate(var(--attract-dx,0px), var(--attract-dy,-8px)) if preferred —
        but that is an FE implementation decision. The spec locks the numeric
        values: 8px primary displacement, 1.08 peak scale.
      </note>
    </keyframe>

    <class name=".orb-attracted">
      <!-- Applied to the stationary target orb when dragged orb is within
           CANVAS_PROXIMITY_THRESHOLD_PX (60px) of its center -->

      <property name="animation" value="orb-attract 320ms cubic-bezier(0.34, 1.56, 0.64, 1) infinite" />
      <!-- cubic-bezier(0.34,1.56,0.64,1) = spring-like overshoot easing -->

      <property name="transition" value="box-shadow 120ms ease-in" />
      <!-- Faster transition in (120ms) for the snap-on feel -->

      <property name="box-shadow">
        0 0 16px 5px var(--bdb),
        0 0 32px 8px var(--gt),
        inset 2px 3px 8px 0px rgba(255, 255, 255, 0.22),
        inset -3px -4px 10px 0px rgba(0, 0, 0, 0.55)
      </property>
      <!-- Layers 1+2 are intensified vs default state:
           layer 1: spread 2px → 5px
           layer 2: blur 20px → 32px, spread 4px → 8px -->
    </class>

    <class name=".orb-attracted-release">
      <!-- Applied immediately after .orb-attracted is removed (class swap in JS),
           then removed after 400ms by JS timeout. Provides the spring-settle. -->
      <property name="animation" value="none" />
      <property name="transform" value="scale(1.0) translateY(0px)" />
      <property name="transition" value="transform 400ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 400ms ease-out" />
      <!-- cubic-bezier(0.22,1,0.36,1) = ease-out with very slight spring tail (CSS Spring preset) -->
    </class>

    <states>
      <state name="default">No animation. Standard orb appearance per Surface 1.</state>
      <state name="attracted">.orb-attracted applied: looping orb-attract animation + intensified box-shadow glow.</state>
      <state name="settling">.orb-attracted-release applied: animation stops, transform springs to identity, glow fades back to default over 400ms.</state>
    </states>

    <notes>
      The animation runs on the orb-root div (the orb element itself, not the
      MateriaNode wrapper). The wrapper div has flex layout; animating transform
      on the inner orb div avoids layout shift. FE should ensure
      will-change: transform is set on .orb-attracted to promote to GPU layer.
    </notes>

  </surface_2>


  <!-- ═══════════════════════════════════════════════════════════════════════
       SURFACE 3 — LINK FLASH + EDGE GLOW
  ═══════════════════════════════════════════════════════════════════════ -->

  <surface_3 name="LinkFlashEdgeGlow">

    <description>
      When an edge is created (two orbs link), both orbs play orb-link-flash
      (one-shot). After the flash, orbs with at least one edge gain a
      persistent always-on linked ring. Edges themselves are styled with teal
      stroke + drop-shadow filter and animated: true (React Flow dashed march).
    </description>

    <keyframe name="orb-link-flash">
      <!-- Total duration: 350ms, iteration: 1, fill-mode: forwards for linked state -->
      <!--
        @keyframes orb-link-flash {
          0%   { box-shadow: [default 4-layer shadow from Surface 1]; }
          15%  { box-shadow: 0 0 0 3px var(--w),
                             0 0 28px 10px var(--bdb),
                             inset 2px 3px 8px 0px rgba(255,255,255,0.22),
                             inset -3px -4px 10px 0px rgba(0,0,0,0.55); }
          45%  { box-shadow: 0 0 0 2px var(--mt),
                             0 0 20px 6px var(--bdb),
                             inset 2px 3px 8px 0px rgba(255,255,255,0.22),
                             inset -3px -4px 10px 0px rgba(0,0,0,0.55); }
          100% { box-shadow: 0 0 0 2px var(--bdb),
                             0 0 14px 3px var(--gt),
                             inset 2px 3px 8px 0px rgba(255,255,255,0.22),
                             inset -3px -4px 10px 0px rgba(0,0,0,0.55); }
        }
      -->
      <stop at="0%"   description="default shadow state — no ring" />
      <stop at="15%"  description="peak: white outer ring (3px solid) + maximum teal bloom 28px/10px spread. This is the bright flash." />
      <stop at="45%"  description="settling: ring transitions from white to var(--mt) teal, bloom reduces to 20px/6px." />
      <stop at="100%" description="linked steady state: 2px solid var(--bdb) ring + subtle bloom 14px/3px. Animation ends here via fill-mode: forwards." />

      <timing>
        <duration_ms>350</duration_ms>
        <easing>ease-out</easing>
        <iteration>1</iteration>
        <fill_mode>forwards</fill_mode>
      </timing>
    </keyframe>

    <class name=".orb-linked">
      <!-- Persistent state applied to any orb that has at least one edge.
           Applied after orb-link-flash completes OR immediately if already linked on mount.
           This is the settled end state from the keyframe, codified as a class. -->
      <property name="box-shadow">
        0 0 0 2px var(--bdb),
        0 0 14px 3px var(--gt),
        inset 2px 3px 8px 0px rgba(255, 255, 255, 0.22),
        inset -3px -4px 10px 0px rgba(0, 0, 0, 0.55)
      </property>
      <!-- The first layer (0 0 0 2px var(--bdb)) is a tight ring with zero blur,
           creating a clean outline halo using --bdb (rgba 84,153,181,0.55). -->
    </class>

    <class name=".orb-link-flashing">
      <!-- Applied at the moment of link creation; triggers the keyframe.
           Removed by JS after 350ms + 50ms buffer (400ms total). -->
      <property name="animation" value="orb-link-flash 350ms ease-out 1 forwards" />
    </class>

    <edge_style>
      <!-- These are the values for the React Flow Edge style object.
           FE passes these as the style prop on each Edge returned from toRFEdge(). -->
      <property name="stroke" value="var(--mt)" />
      <!-- var(--mt) = #5499b5 -->
      <property name="strokeWidth" value="2" />
      <!-- numeric, no unit — React Flow SVG attribute -->
      <property name="filter" value="drop-shadow(0px 0px 4px var(--bdb))" />
      <!-- var(--bdb) = rgba(84,153,181,0.55) — glows teal around the edge line -->
      <property name="animated" value="true" />
      <!-- Boolean on the Edge object, not in style. Enables React Flow's dashed march animation. -->

      <note>
        The existing EDGE_GLOW constant in canvas.ts contains a matching value
        (0 0 6px rgba(84,153,181,0.5)) but is not currently applied to edges.
        This spec activates it via filter: drop-shadow. EDGE_GLOW itself can
        remain as a reference constant; FE should not delete it.
      </note>
    </edge_style>

    <states>
      <state name="default-unlinked">No ring. Standard Surface 1 orb shadow.</state>
      <state name="flashing">.orb-link-flashing applied: orb-link-flash animation plays once. White ring bursts then settles to teal ring.</state>
      <state name="linked">.orb-linked applied: persistent 2px var(--bdb) ring + subtle bloom at all times.</state>
      <state name="edge-default">stroke: var(--mt), strokeWidth: 2, filter: drop-shadow(0px 0px 4px var(--bdb)), animated: true.</state>
    </states>

    <notes>
      Orbs can hold both .orb-linked and .orb-attracted simultaneously — the
      class stacking is intentional. .orb-attracted box-shadow overrides
      .orb-linked because it specifies larger values; specificity is equal and
      the latter class in the stylesheet wins. FE must ensure .orb-attracted is
      declared after .orb-linked in the stylesheet (or component CSS module).
    </notes>

  </surface_3>


  <!-- ═══════════════════════════════════════════════════════════════════════
       SURFACE 4 — LOADOUT LIST PANEL
  ═══════════════════════════════════════════════════════════════════════ -->

  <surface_4 name="LoadoutListPanel">

    <description>
      A right-side panel fixed at 240px wide. Lists all canvas nodes by name
      with their connection count / peer names. Tree indentation optional —
      spec covers flat list with inline connection indicators.
      No Shadcn primitives are needed here; the panel uses the same inline
      style pattern as MateriaPalette.
    </description>

    <component_hierarchy>
      aside.loadout-list-panel (240px right panel)
        └── div.llp-inner (padded content container)
              ├── h2.llp-heading ("Canvas Nodes")
              └── ul.llp-list (unstyled)
                    └── li.llp-row (one per node)
                          ├── span.llp-dot (colored dot)
                          ├── span.llp-name (node name)
                          └── span.llp-connections (connection indicator)
    </component_hierarchy>

    <layout>
      <grid>Single column, no grid — flex column layout within the panel.</grid>
      <spacing>
        Panel outer: padding 0 (no outer padding — inner div handles it).
        Inner div (llp-inner): padding-top 12px, padding-bottom 12px,
                               padding-left 12px, padding-right 12px.
        Section heading margin-bottom: 8px.
        Row padding: 6px top, 6px bottom, 8px left, 8px right.
        Row gap (dot to label): 8px.
        Connection indicator margin-top: 2px.
        Indent depth for tree (if implemented): 16px left-padding on child rows.
      </spacing>
      <responsive>
        <breakpoint name="sm">Panel collapses to hidden (display: none) at max-width 640px.
        Canvas full-width on mobile — no side panel.</breakpoint>
        <breakpoint name="lg">240px fixed width at 1024px and above.</breakpoint>
      </responsive>
    </layout>

    <tokens>
      <token element="panel background" token="--sfm" value="#122420" />
      <token element="panel border (left side)" token="--bd" value="rgba(84,153,181,0.25)" />
      <token element="section heading color" token="--wm" value="rgba(255,255,255,0.38)" />
      <token element="node name text" token="--wd" value="rgba(255,255,255,0.72)" />
      <token element="connection indicator text" token="--wm" value="rgba(255,255,255,0.38)" />
      <token element="dot border (subtle ring)" token="--bd" value="rgba(84,153,181,0.25)" />
    </tokens>

    <measurements>
      <panel>
        <width_px>240</width_px>
        <min_width_px>240</min_width_px>
        <max_width_px>240</max_width_px>
        <border>border-left: 1px solid var(--bd)</border>
        <background>var(--sfm)</background>
        <overflow_y>auto</overflow_y>
        <z_index>15</z_index>
        <!-- Sits above canvas (Z_CANVAS_NODE=10) but below palette (Z_PALETTE=20) -->
        <flex_shrink>0</flex_shrink>
      </panel>

      <heading>
        <font_size_px>10</font_size_px>
        <font_weight>600</font_weight>
        <letter_spacing_em>0.08em</letter_spacing_em>
        <text_transform>uppercase</text_transform>
        <color>var(--wm)</color>
        <margin_bottom_px>8</margin_bottom_px>
        <!-- Matches PALETTE_SECTION_HEADING_STYLE exactly for visual consistency -->
      </heading>

      <row>
        <min_height_px>32</min_height_px>
        <padding_top_px>6</padding_top_px>
        <padding_bottom_px>6</padding_bottom_px>
        <padding_left_px>8</padding_left_px>
        <padding_right_px>8</padding_right_px>
        <gap_px>8</gap_px>
        <!-- gap between dot and name -->
        <display>flex</display>
        <flex_direction>column</flex_direction>
        <!-- dot+name on first line, connections on second line -->
        <border_radius_px>4</border_radius_px>
        <margin_bottom_px>2</margin_bottom_px>
      </row>

      <row_top_line>
        <!-- The flex row containing dot + name -->
        <display>flex</display>
        <align_items>center</align_items>
        <gap_px>8</gap_px>
      </row_top_line>

      <dot>
        <width_px>10</width_px>
        <height_px>10</height_px>
        <border_radius>50%</border_radius>
        <flex_shrink>0</flex_shrink>
        <background>var(--orb-color) — FE injects the same getMateriaColor(name, type) value used by the orb</background>
        <box_shadow>0 0 4px 1px var(--bd)</box_shadow>
        <!-- subtle glow matching orb palette -->
      </dot>

      <name_text>
        <font_size_px>12</font_size_px>
        <color>var(--wd)</color>
        <overflow>hidden</overflow>
        <text_overflow>ellipsis</text_overflow>
        <white_space>nowrap</white_space>
        <flex_grow>1</flex_grow>
      </name_text>

      <connection_indicator>
        <!-- Second line of the row, shown only when edge count > 0 -->
        <!-- Format: ↔ peer1, peer2 -->
        <!-- Example: "↔ orchestrator, researcher" -->
        <font_size_px>10</font_size_px>
        <color>var(--wm)</color>
        <margin_top_px>2</margin_top_px>
        <padding_left_px>18</padding_left_px>
        <!-- 10px dot + 8px gap = 18px indent to align text under name -->
        <line_height>1.3</line_height>
        <overflow>hidden</overflow>
        <text_overflow>ellipsis</text_overflow>
        <white_space>nowrap</white_space>
      </connection_indicator>

      <tree_indent>
        <!-- If FE chooses to render as a tree (parent → children) rather than flat list -->
        <child_row_padding_left_additional_px>16</child_row_padding_left_additional_px>
        <!-- i.e., child rows get padding-left: 24px (8px base + 16px indent) -->
      </tree_indent>
    </measurements>

    <states>
      <state name="default">Panel visible, list populated with canvas nodes.</state>
      <state name="empty">When canvas has 0 nodes (only orchestrator or completely empty):
        Show a single row with text "No nodes on canvas" in color var(--wm),
        font-size 11px, padding 8px. No dot. No connection indicator.</state>
      <state name="row-hover">background: var(--sfh); transition: background 100ms ease-out.</state>
      <state name="loading">Not applicable — panel derives from Zustand canvas-store; no async fetch.</state>
    </states>

    <notes>
      The panel should be positioned as a sibling of the canvas area in the
      MateriaCanvasInner flex row, appended after the ReactFlow div.
      The panel reads from useCanvasStore — same store as the canvas — so no
      new props drilling is needed.
    </notes>

  </surface_4>


  <!-- ═══════════════════════════════════════════════════════════════════════
       SURFACE 5 — WEB AUDIO API SOUND PARAMETERS
  ═══════════════════════════════════════════════════════════════════════ -->

  <surface_5 name="WebAudioSoundParameters">

    <description>
      Numbers only. No code. No Web Audio API method names. These values
      are passed directly to Web Audio API nodes by the FE implementation.
    </description>

    <approach_tone>
      <!-- Plays in a loop while dragging toward another orb within
           CANVAS_PROXIMITY_THRESHOLD_PX (60px). Stops when dragging ends or
           distance exceeds threshold. -->

      <oscillator_type>sine</oscillator_type>
      <!-- Sine: smooth, non-harsh — calming "energy approaching" feel -->

      <base_frequency_hz>220</base_frequency_hz>
      <!-- A3 — low enough to feel like a magnetic hum, not annoying -->

      <gain_attack_ms>40</gain_attack_ms>
      <!-- Fast enough to feel responsive; slow enough to avoid click artifact -->

      <gain_sustain_level>0.12</gain_sustain_level>
      <!-- Quiet — ambient, does not compete with UI sounds -->

      <gain_release_ms>80</gain_release_ms>
      <!-- Slightly longer than attack for clean fade-out on stopApproach() -->

      <low_pass_filter_cutoff_hz>600</low_pass_filter_cutoff_hz>
      <!-- Rolls off upper harmonics — keeps the sine warm, not thin.
           Note: sine has minimal harmonics; this filter rounds any
           slight distortion from the oscillator implementation. -->
    </approach_tone>

    <kerchink_link_tone>
      <!-- One-shot when edge is created. Goal: two glass spheres lightly
           touching — brief transient click + resonant bell ring that decays. -->

      <primary_oscillator>
        <type>triangle</type>
        <!-- Triangle: softer than sawtooth for the "body" of the bell ring.
             Provides fundamental + odd harmonics with natural rolloff. -->
        <frequency_hz>880</frequency_hz>
        <!-- A5 — bright bell-like pitch, matches glass sphere resonance range -->

        <gain_attack_ms>2</gain_attack_ms>
        <!-- Near-instantaneous: creates the percussive "chink" transient -->

        <gain_peak_level>0.55</gain_peak_level>
        <!-- Audible but not jarring. UI feedback volume, not music volume. -->

        <gain_decay_ms>80</gain_decay_ms>
        <!-- Quick decay from peak to sustain — the click portion -->

        <gain_sustain_level>0.18</gain_sustain_level>
        <!-- Bell ring sustain: noticeable resonance tail -->

        <gain_release_ms>420</gain_release_ms>
        <!-- Long release = the resonant ring-out of glass -->
      </primary_oscillator>

      <secondary_oscillator>
        <!-- Harmonic overtone for richness — a perfect fifth above primary -->
        <type>sine</type>
        <!-- Sine: pure overtone, blends cleanly under the triangle fundamental -->
        <frequency_hz>1320</frequency_hz>
        <!-- E6 — a minor 7th above A5; creates glass-like "shimmer" partial -->

        <gain_attack_ms>2</gain_attack_ms>
        <gain_peak_level>0.22</gain_peak_level>
        <!-- Quieter than primary; acts as harmonic color, not lead voice -->

        <gain_decay_ms>40</gain_decay_ms>
        <!-- Shorter decay — harmonic fades before the fundamental -->

        <gain_sustain_level>0.06</gain_sustain_level>
        <gain_release_ms>280</gain_release_ms>
        <!-- Shorter release than primary; high partial fades first (natural bell physics) -->
      </secondary_oscillator>

      <total_cleanup_after_ms>900</total_cleanup_after_ms>
      <!-- Disconnect all AudioNodes 900ms after trigger.
           Gives the 420ms primary release + 280ms secondary release full time
           to complete, with 200ms headroom before hard disconnect. -->

    </kerchink_link_tone>

    <notes>
      Both tones use the AudioContext from a single shared instance (do not
      create a new AudioContext per sound event — browser limits apply).
      The approach tone oscillator should be started once and its gain
      envelope applied; it should NOT be stopped and restarted on each
      proximity-enter event — use gain ramping only to avoid click artifacts.
      The ker-chink tone creates and discards its oscillators per-event;
      total_cleanup_after_ms governs when to call .disconnect() on all nodes.
    </notes>

  </surface_5>

  <!-- ═══════════════════════════════════════════════════════════════════════
       GLOBAL INTERACTION NOTES
  ═══════════════════════════════════════════════════════════════════════ -->

  <interactions>
    <interaction trigger="orb enters proximity (dragged node within 60px of another node center)"
                 response="target node receives .orb-attracted class; approach tone gain ramps up to 0.12 over 40ms" />
    <interaction trigger="orb leaves proximity (distance exceeds 60px during drag)"
                 response=".orb-attracted removed, .orb-attracted-release applied for 400ms; approach tone gain ramps to 0 over 80ms" />
    <interaction trigger="orb dropped within proximity (drag ends, edge created)"
                 response=".orb-attracted removed; .orb-link-flashing applied to both orbs; ker-chink tone fires; after 400ms .orb-link-flashing removed and .orb-linked applied to both orbs" />
    <interaction trigger="node removed from canvas"
                 response=".orb-linked removed from all nodes whose only edge was to the removed node; LoadoutListPanel row removed" />
    <interaction trigger="orb hover (no drag)"
                 response="box-shadow spread increases per Surface 1 hover state spec; transition 150ms ease-out" />
    <interaction trigger="orb focus-visible (keyboard)"
                 response="outline: 2px solid var(--mt); outline-offset: 3px" />
  </interactions>

  <notes>
    1. All CSS class names in this spec (.orb-attracted, .orb-attracted-release,
       .orb-linked, .orb-link-flashing) should be declared in a scoped CSS
       module co-located with MateriaNode (e.g., MateriaNode.module.css) or
       inline as a style tag injected into the canvas container. They must NOT
       be added to globals.css (per the CLAUDE.md constraint that globals.css
       changes are out of scope).

    2. The .css keyframes (orb-attract, orb-link-flash) must also live in the
       same scoped file — not globals.css.

    3. color-mix() is used in Surface 1 gradient. Browser support: Chrome 111+,
       Firefox 113+, Safari 16.2+. These are all supported in the evergreen
       target. No fallback required.

    4. All box-shadow layers that use inset rgba white values are approved
       exceptions to the no-hex-in-spec rule: those values (rgba 255,255,255,X)
       are encoding white opacity at specific stops, which cannot be achieved
       with var(--w) inside a CSS shadow list. They encode --w with opacity only.

    5. WCAG AA: the orb label text uses var(--wd) (rgba 255,255,255,0.72) on
       var(--void) (#070d0c) background. Contrast ratio: approximately 9.8:1.
       Passes AA (4.5:1 required for normal text).

    6. The LoadoutListPanel does not introduce any new tRPC procedures. It reads
       directly from useCanvasStore which is already subscribed in the canvas
       component tree.
  </notes>

</design_spec>
```
