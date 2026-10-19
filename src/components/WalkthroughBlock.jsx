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
  const readoutOf = (item) => (item.id === 'decision' && decision ? fill(labels.decisionReadout, { kind: decision }) : item.readout);

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
            <div className="wt-figfoots">
              {steps.map((item, i) => (
                <p key={item.id} className="wt-figfoot wt-readout" data-current={i === idx ? '' : undefined} aria-hidden={i === idx ? undefined : 'true'}>
                  {readoutOf(item)}
                </p>
              ))}
            </div>
          </div>

          <div
            ref={readoutRef}
            className="wt-ro"
            onPointerEnter={actions.onReadoutEnter}
            onPointerLeave={actions.onReadoutLeave}
          >
            {steps.map((item, i) => {
              const here = i === idx;
              // Only the open step is replayed (its key carries the run); the others sit still and unseen.
              const run = here ? runId : 'rest';
              const text = item.id === 'decision' && decision ? fill(labels.recorded, { kind: decision }) : labels.waiting;
              return (
                <div key={item.id} className="wt-ro-step" data-current={here ? '' : undefined} aria-hidden={here ? undefined : 'true'}>
                  <p key={`k-${run}`} className="wt-ro-k wt-in" style={{ '--i': 0 }}>
                    <span className="wt-ro-n">{fill(labels.stepOf, { n: i + 1, total })}</span>
                    {item.label}
                    <span className="wt-tag" data-tag={item.tag}>
                      {item.tag}
                    </span>
                  </p>
                  <p key={`d-${run}`} className="wt-ro-does wt-in" style={{ '--i': 1 }}>
                    {item.does}
                  </p>
                  {item.person && (
                    <p key={`p-${run}`} className="wt-ro-person wt-in" style={{ '--i': 2 }}>
                      <b>{labels.person} </b>
                      {item.person}
                    </p>
                  )}
                  {item.id === 'decision' && (
                    <>
                      <p key={`w-${run}`} className="wt-kick wt-in" style={{ '--i': 3 }}>
                        <span className={`wt-pdot${decision ? ' wt-grey' : ''}`} aria-hidden="true" />
                        {text}
                      </p>
                      <div key={`b-${run}`} className="wt-btns wt-in" style={{ '--i': 4 }}>
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
                  {item.evidence && (
                    <p key={`e-${run}`} className="wt-ro-ev wt-in" style={{ '--i': 5 }}>
                      <span className="wt-muted">{labels.evidence}</span>
                      <span>{item.evidence}</span>
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="wt-controls">
          <button type="button" className="wt-ctl" hidden={calm || ended || waiting} onClick={actions.togglePlay}>
            {walk.playing ? controls.pause : controls.play}
          </button>
          <button type="button" className="wt-ctl" hidden={ended} onClick={actions.next}>
            {controls.next}
          </button>
          <p className="wt-hint" data-show={waiting ? '' : undefined} aria-hidden={waiting ? undefined : 'true'}>
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
