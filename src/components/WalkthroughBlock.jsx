import OrionBench from './walkthroughs/OrionBench';
import useWalkthrough from './walkthroughs/useWalkthrough';

// The figures a walkthrough block can name. A name that is not here throws, the same fail-loud
// shape the block switch in CaseStudyPage has for an unknown block type (ADR 0006).
const FIGURES = { 'orion-bench': OrionBench };

const DECISION_KINDS = ['approve', 'waive', 'reject'];

/**
 * The case-study walkthrough block: a console with a step rail, an animated figure, a readout for
 * the open step and the controls, then the full ordered step list so every word is readable at
 * rest. Every word comes from the block (portfolioData); the figure is chosen by name. Server
 * rendering and the first client render show step one at rest.
 */
export default function WalkthroughBlock({ block }) {
  const Figure = FIGURES[block.figure];
  if (!Figure) throw new Error(`Unknown walkthrough figure "${block.figure}".`);

  const walk = useWalkthrough(block);
  const { steps, controls, legend, labels } = block;
  const { idx, step, decision, calm, waiting, ended, runId, actions } = walk;
  const { consoleRef, stageRef, railRef, readoutRef, againRef, tabRefs, trackRefs } = walk.refs;
  const total = steps.length;
  const fill = (template, values) => Object.entries(values).reduce((text, [key, value]) => text.replace(`{${key}}`, String(value)), template);
  const stepName = (i) => fill(block.announce.step, { n: i + 1, label: steps[i].label, tag: steps[i].tag });
  const readout = step.id === 'decision' && decision ? fill(labels.decisionReadout, { kind: decision }) : step.readout;

  return (
    <div className="wt">
      <div
        ref={consoleRef}
        className="wt-console"
        role="region"
        aria-label={block.regionLabel}
        data-phase={walk.phase}
        onFocus={actions.onFocus}
        onBlur={actions.onBlur}
      >
        <div className="wt-chrome">
          <span className="wt-sdot" aria-hidden="true" />
          <p className="wt-ttl">
            <b>{block.name}</b> <span className="wt-muted">{walk.stateText}</span>
          </p>
          <p className="wt-note">{block.note}</p>
          <a className="wt-skip" href="#wt-steps">
            {controls.skip}
          </a>
        </div>

        <div className="wt-railbox">
          <ol ref={railRef} className="wt-rail" aria-label={block.stepsLabel} onKeyDown={actions.onRailKeyDown}>
            {steps.map((item, i) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="wt-tab"
                  data-go={item.id}
                  data-state={i < idx ? 'done' : i === idx ? (ended ? 'done' : 'current') : 'todo'}
                  tabIndex={i === idx ? 0 : -1}
                  aria-current={i === idx ? 'step' : undefined}
                  aria-label={stepName(i)}
                  ref={(node) => {
                    tabRefs.current[i] = node;
                  }}
                  onClick={() => actions.goTo(i)}
                >
                  <span className="wt-tab-l">
                    {item.label}
                    {item.tag === 'designed' && <span className="wt-tab-t"> {labels.designedSuffix}</span>}
                  </span>
                  <span className="wt-track" aria-hidden="true">
                    <i
                      ref={(node) => {
                        trackRefs.current[i] = node;
                      }}
                    />
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>

        <div className="wt-body">
          <div ref={stageRef} className="wt-stage" tabIndex={-1} aria-label={block.stageLabel} data-mood={waiting ? 'wait' : 'work'}>
            <div className="wt-glow" aria-hidden="true">
              <i className="wt-b1" />
              <i className="wt-b2" />
              <i className="wt-b3" />
            </div>
            <div className="wt-corners" aria-hidden="true">
              <span className="wt-corner wt-fig-n">{block.caption.number}</span>
              <span className="wt-corner wt-fig-t">{block.caption.title}</span>
            </div>
            <Figure stepId={step.id} calm={calm} decision={decision} runId={runId} />
            <p className="wt-figfoot wt-readout">{readout}</p>
          </div>

          <div
            ref={readoutRef}
            className="wt-ro"
            aria-live="polite"
            onPointerEnter={actions.onReadoutEnter}
            onPointerLeave={actions.onReadoutLeave}
          >
            <p key={`k-${idx}-${runId}`} className="wt-ro-k wt-in" style={{ '--i': 0 }}>
              <span className="wt-ro-n">{fill(labels.stepOf, { n: idx + 1, total })}</span>
              {step.label}
              <span className="wt-tag" data-tag={step.tag}>
                {step.tag}
              </span>
            </p>
            <p key={`d-${idx}-${runId}`} className="wt-ro-does wt-in" style={{ '--i': 1 }}>
              {step.does}
            </p>
            {step.person && (
              <p key={`p-${idx}-${runId}`} className="wt-ro-person wt-in" style={{ '--i': 2 }}>
                <b>{labels.person} </b>
                {step.person}
              </p>
            )}
            {step.id === 'decision' && (
              <>
                <p key={`w-${idx}-${runId}`} className="wt-kick wt-in" style={{ '--i': 3 }}>
                  <span className={`wt-pdot${decision ? ' wt-grey' : ''}`} aria-hidden="true" />
                  {decision ? fill(labels.recorded, { kind: decision }) : labels.waiting}
                </p>
                <div key={`b-${idx}-${runId}`} className="wt-btns wt-in" style={{ '--i': 4 }}>
                  {DECISION_KINDS.map((kind) => (
                    <button
                      key={kind}
                      type="button"
                      className={`wt-pill ${kind === 'approve' ? 'wt-pill-dark' : 'wt-pill-line'}`}
                      disabled={decision !== null}
                      onClick={() => actions.decide(kind)}
                    >
                      {controls[kind]}
                    </button>
                  ))}
                </div>
              </>
            )}
            {step.evidence && (
              <p key={`e-${idx}-${runId}`} className="wt-ro-ev wt-in" style={{ '--i': 5 }}>
                <span className="wt-muted">{labels.evidence}</span>
                <span>{step.evidence}</span>
              </p>
            )}
          </div>
        </div>

        <div className="wt-controls">
          <button type="button" className="wt-ctl" hidden={calm || ended || waiting} onClick={actions.togglePlay}>
            {walk.playing ? controls.pause : controls.play}
          </button>
          <button type="button" className="wt-ctl" hidden={ended} onClick={actions.next}>
            {controls.next}
          </button>
          <p className="wt-hint" hidden={!waiting}>
            {block.hint}
          </p>
          <button
            type="button"
            ref={againRef}
            className={`wt-ctl wt-again${ended ? ' wt-primary' : ''}`}
            hidden={!(ended || idx > 0)}
            onClick={actions.replay}
          >
            {controls.replay}
          </button>
        </div>
        <p className="sr-only" aria-live="polite">
          {walk.live}
        </p>
      </div>

      <p className="wt-legend">
        {legend.map((item) => (
          <span key={item.term}>
            <b>{item.term}</b> {item.meaning}
          </span>
        ))}
      </p>

      <div className="wt-steps">
        <h3 className="wt-steps-h">{block.listHeading}</h3>
        <ol id="wt-steps" className="wt-sl">
          {steps.map((item, i) => (
            <li key={item.id}>
              <span className="wt-n">{String(i + 1).padStart(2, '0')}</span>
              <p className="wt-t">
                <b>{item.label}</b>
                <span className="wt-tag" data-tag={item.tag}>
                  {item.tag}
                </span>
              </p>
              <p className="wt-d">{item.does}</p>
              {item.person && (
                <p className="wt-p">
                  {labels.personInList} {item.person}
                </p>
              )}
              <button
                type="button"
                className="wt-show"
                aria-label={fill(labels.showAria, { n: i + 1, label: item.label })}
                onClick={() => {
                  actions.goTo(i);
                  consoleRef.current?.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' });
                  tabRefs.current[i]?.focus({ preventScroll: true });
                }}
              >
                {controls.show}
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
