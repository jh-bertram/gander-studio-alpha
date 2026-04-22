# Research Dossier — Web Audio API Autoplay Policy for Drag Gesture Audio

**task_id:** gander-studio-p2-canvas-link-003-RA
**agent_id:** RA#1
**ts:** 2026-03-28

---

```xml
<research_dossier>
  <query>Web Audio API autoplay policy in Chromium latest stable — AudioContext initialization and OscillatorNode behavior during drag gestures</query>

  <summary>
    In Chromium latest stable, calling AudioContext.resume() inside a mousedown (or onMouseDown/onDragStart React) event handler grants the page sticky activation, which is the persistent session-level gate that Web Audio API requires. Once sticky activation is established via mousedown, the AudioContext.state transitions to 'running' and audio from OscillatorNode.start() called during subsequent onMouseMove events in the same drag gesture plays audibly — mousemove events do not need to be activation events themselves, because sticky activation persists for the entire page session. The correct implementation uses a single lazily-initialized AudioContext singleton per page and creates a fresh OscillatorNode per sound; stop() on an already-stopped node is safe and produces no exception.
  </summary>

  <findings>

    <point id="Q1">
      <claim>YES — calling AudioContext.resume() in onMouseDown (a user activation event) is sufficient for AudioContext.state to reach 'running', and audio from OscillatorNode.start() called during subsequent onMouseMove events in the same drag gesture will play audibly.</claim>
      <source>https://developer.mozilla.org/en-US/docs/Glossary/Sticky_activation</source>
      <source>https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/User_activation</source>
      <source>https://developer.mozilla.org/en-US/docs/Glossary/Transient_activation</source>
      <explanation>
        The Web Audio API autoplay restriction gates AudioContext on "sticky activation" — a persistent window-level flag, not a per-event flag. Per the MDN sticky activation glossary and the W3C Web Audio 1.1 spec (section 4.2.1, AudioContext constructor): "A user agent may delay the initial transition of an AudioContext from 'suspended' to 'running', and allow it only when the AudioContext's relevant global object has sticky activation."

        Sticky activation is set once and remains set for the entire page session. The events that SET sticky activation are: mousedown/pointerdown (mouse), pointerup (non-mouse pointer), touchend, and keydown (excluding Escape). mousemove does NOT set sticky activation — MDN explicitly states: "The window is not user-activated by events that aren't necessarily caused by intentional interaction with the window, such as mouse move events or wheel events." (MDN Transient Activation, MDN User Activation security page.)

        However, mousemove does not NEED to set activation. Because onMouseDown fires before the drag begins, and mousedown IS a sticky-activation-granting event, calling AudioContext.resume() in onMouseDown is sufficient. After that call resolves, the AudioContext is in state 'running' for the duration of the session. All subsequent OscillatorNode.start() calls — including those triggered by onMouseMove — execute against a running context and produce audible audio. No further user gesture is required per mousemove event.

        This is confirmed by Chrome's autoplay policy documentation, which lists the activation-triggering events as: 'click', 'contextmenu', 'auxclick', 'dblclick', 'mousedown', 'mouseup', 'pointerup', 'touchend', 'keydown', 'keyup'. mousedown is explicitly included. mousemove is absent.
      </explanation>
      <relevance>The FE implementation should call AudioContext.resume() (or construct AudioContext lazily) inside onMouseDown. All OscillatorNode.start() calls in onMouseMove handlers during the resulting drag gesture will produce audible audio without any additional activation logic.</relevance>
    </point>

    <point id="Q2">
      <claim>N/A — Q1 is YES. onMouseDown is a valid activation event; no fallback pattern is needed.</claim>
      <source>https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/User_activation</source>
      <relevance>No alternative pattern required for drag gesture audio in Chromium.</relevance>
    </point>

    <point id="Q3_lifecycle">
      <claim>A single AudioContext instance should be created lazily on the first user gesture and reused for the lifetime of the application. Creating a new AudioContext per interaction is explicitly discouraged.</claim>
      <source>https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices</source>
      <explanation>MDN Web Audio API Best Practices states: "It's recommended to create one AudioContext and reuse it instead of initializing a new one each time." Creating multiple AudioContext instances is wasteful (each maintains its own audio thread and processing graph) and was historically limited to 6 concurrent contexts per tab in Chrome (pre-Chrome 66). The correct pattern: check if an instance exists; if not, create it inside the first user gesture handler (onMouseDown); thereafter reuse the same instance. Also check state and call resume() if it is 'suspended' before each use, since browsers can suspend contexts automatically (e.g., on tab hide).</explanation>
      <relevance>The FE implementation should hold the AudioContext in a module-level variable or Zustand store, initialize it on first mousedown, and reuse it for every subsequent drag-tone sound.</relevance>
    </point>

    <point id="Q3_cleanup">
      <claim>The correct cleanup pattern for a one-shot OscillatorNode + GainNode is: (1) schedule oscillator.stop(audioCtx.currentTime + durationSec) at start time; (2) in the oscillator's 'ended' event handler (oscillator.addEventListener('ended', ...)), call oscillator.disconnect() and gainNode.disconnect(). This is necessary because GainNode does not auto-disconnect when the source stops.</claim>
      <source>https://developer.mozilla.org/en-US/docs/Web/API/AudioScheduledSourceNode/stop</source>
      <source>https://github.com/WebAudio/web-audio-api/issues/818</source>
      <explanation>OscillatorNode (and all AudioScheduledSourceNode subtypes) are single-use: once started and stopped, they cannot be restarted. Each playback requires a new node. The MDN stop() documentation confirms the scheduling pattern: oscillator.stop(context.currentTime + durationSec). The Web Audio API spec issue #818 documents the GainNode leak: "gainNode may be silenced, but it continues to eat up CPU cycles" if not explicitly disconnected. Disconnecting in the 'ended' handler is the standard pattern to release the processing subgraph and prevent memory/CPU accumulation across many short sounds.</explanation>
      <relevance>For the ker-chink approach tone: create new OscillatorNode + GainNode per drag start, connect them, call start(), call stop(audioCtx.currentTime + duration), and in the 'ended' handler disconnect both nodes. Do not attempt to reuse the OscillatorNode across drags.</relevance>
    </point>

    <point id="Q3_stop_safety">
      <claim>It is safe to call oscillator.stop() on a node that has already stopped — the call has no effect and does not throw. The only exception stop() throws is InvalidStateError when stop() is called before start() has been called, and RangeError when the 'when' argument is negative.</claim>
      <source>https://developer.mozilla.org/en-US/docs/Web/API/AudioScheduledSourceNode/stop</source>
      <explanation>MDN AudioScheduledSourceNode.stop() states explicitly: "If the node has already stopped, this method has no effect." The sole InvalidStateError condition is calling stop() before start(). Therefore, defensive calls to stop() during cleanup (e.g., if a drag is cancelled mid-sound) are safe without a try/catch, as long as start() was previously called.</explanation>
      <relevance>The FE implementation can safely call oscillator.stop() in a drag-cancel handler or an early-exit path without needing a try/catch, provided start() has been called.</relevance>
    </point>

  </findings>

  <conflicting_data>
    The W3C Web Audio API spec section on AudioContext construction states that an AudioContext "may" start in 'suspended' state — browsers are not required to do so. In practice, Chromium always starts an AudioContext in 'suspended' if created before any user gesture on the page, but starts it in 'running' if created inside a user gesture handler (e.g., directly inside an onclick). This means if the AudioContext is constructed inside onMouseDown (rather than lazily before), the state may immediately be 'running' without needing an explicit resume() call. MDN best practices recommends always checking state and calling resume() if 'suspended' regardless, because auto-resume behavior is implementation-defined. There is no conflict on the core claim — mousedown grants sticky activation and audio is playable in mousemove after that — but there is ambiguity on whether resume() is needed or whether construction-inside-gesture is sufficient. The safe pattern is to check state and call resume() defensively.

    Source A (W3C Web Audio spec, AudioContext constructor): "The state attribute, on getting, must return the current state of this AudioContext."
    Source B (MDN Best Practices): "When working with an AudioContext, if you create the audio context from inside a click event the state should automatically be set to running."
    Reconciliation: Construct lazily in mousedown + check state and resume() defensively if 'suspended'. This covers both the auto-running case and the pre-constructed-suspended case.
  </conflicting_data>

  <staleness_risk>
    MEDIUM. The sticky activation model and the list of activation-granting events (mousedown, pointerup, touchend, keydown) have been stable since Chrome M70 (2018) and are now codified in the WHATWG HTML Living Standard. However:
    - Browser vendors occasionally adjust the autoplay policy threshold (e.g., Chrome's Media Engagement Index affects media elements but not Web Audio API directly).
    - The WHATWG HTML spec's activation model is a living standard and could add or remove events from the activation-triggering list.
    - The OscillatorNode stop() safety guarantee ("no effect if already stopped") was clarified in a spec update to resolve ambiguity in W3C Web Audio issue #1351 — the old spec text was ambiguous. The current MDN documentation reflects the resolved behavior, but very old browser versions (pre-2018) may have thrown. This is not a concern for Chromium latest stable.
    Re-verify the activation event list against MDN Glossary/Transient_activation before shipping if more than 6 months pass, as this is the most likely item to change.
  </staleness_risk>

  <sources>
    <url>https://developer.mozilla.org/en-US/docs/Glossary/Sticky_activation</url>
    <url>https://developer.mozilla.org/en-US/docs/Glossary/Transient_activation</url>
    <url>https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/User_activation</url>
    <url>https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices</url>
    <url>https://developer.mozilla.org/en-US/docs/Web/API/AudioScheduledSourceNode/stop</url>
    <url>https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/resume</url>
    <url>https://developer.chrome.com/blog/web-audio-autoplay</url>
    <url>https://developer.chrome.com/blog/autoplay</url>
    <url>https://www.chromium.org/audio-video/autoplay/</url>
    <url>https://github.com/WebAudio/web-audio-api/issues/818</url>
    <url>https://github.com/WebAudio/web-audio-api/issues/1351</url>
    <url>https://www.w3.org/TR/webaudio-1.1/</url>
  </sources>

</research_dossier>
```
