import { Fragment } from 'react';
import AtelierFloor from './walkthroughs/AtelierFloor';
import OrionBench from './walkthroughs/OrionBench';
import useWalkthrough from './walkthroughs/useWalkthrough';

// The figures a walkthrough block can name. A name that is not here throws, the same fail-loud
// shape the block switch in CaseStudyPage has for an unknown block type (ADR 0006).
const FIGURES = { 'orion-bench': OrionBench, 'atelier-floor': AtelierFloor };

const DECISION_KINDS = ['approve', 'waive', 'reject'];

/**
 * The case-study walkthrough block: a console with a step rail, an animated figure, a readout for
 * the open step and the controls, then the full ordered step list so every word is readable at
 * rest. Every word comes from the block (portfolioData); the figure is chosen by name. Server
 * rendering and the first client render show step one at rest.
 *
 * Three optional behaviours are switched on by the block's own fields and change nothing for a
 * block without them: a step with `agents` also opens one role card per agent (every card is in
 * the markup, stacked in the readout's one cell, and only the open one shows); `autoplay: false`
 * removes the clock and the Play button and adds Previous; and `glowStep` lights the stage on the
 * step where a person decides.
 */
export default function WalkthroughBlock({ block }) {
  const Figure = FIGURES[block.figure];
  if (!Figure) throw new Error(`Unknown walkthrough figure "${block.figure}".`);

  const walk = useWalkthrough(block);
  const { steps, controls, legend, labels } = block;
  const { idx, step, agent, clickDriven, decision, calm, waiting, ended, runId, actions } = walk;
  const { consoleRef, stageRef, railRef, readoutRef, againRef, tabRefs, trackRefs } = walk.refs;
  const total = steps.length;
  const hasAgents = steps.some((item) => Array.isArray(item.agents));
  const hasFootnotes = steps.some((item) => item.readout);
  const fill = (template, values) => Object.entries(values).reduce((text, [key, value]) => text.replace(`{${key}}`, String(value)), template);
  const stepName = (i) => fill(block.announce.step, { n: i + 1, total, label: steps[i].label, tag: steps[i].tag });
  // A phase picked on the figure itself (a tap on its station) opens like a rail button.
  const pickStep = (id) => {
    const index = steps.findIndex((item) => item.id === id);
    if (index >= 0) actions.goTo(index);
  };
  const readoutOf = (item) => (item.id === 'decision' && decision ? fill(labels.decisionReadout, { kind: decision }) : item.readout);

  return (
    <div className="wt" data-agents={hasAgents ? '' : undefined}>
      <div
        ref={consoleRef}
        className="wt-console"
        role="region"
        aria-label={block.regionLabel}
        data-phase={walk.phase}
        onFocus={actions.onFocus}
        onBlur={actions.onBlur}
        onKeyDown={actions.onConsoleKeyDown}
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
                  data-tag={item.tag}
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
          <div ref={stageRef} className="wt-stage" tabIndex={-1} aria-label={block.stageLabel} data-mood={waiting || step.id === block.glowStep ? 'wait' : 'work'}>
            <div className="wt-glow" aria-hidden="true">
              <i className="wt-b1" />
              <i className="wt-b2" />
              <i className="wt-b3" />
            </div>
            <div className="wt-corners" aria-hidden="true">
              <span className="wt-corner wt-fig-n">{block.caption.number}</span>
              <span className="wt-corner wt-fig-t">{block.caption.title}</span>
            </div>
            <Figure stepId={step.id} calm={calm} decision={decision} runId={runId} pace={block.pace ?? 1} live={walk.figureLive} onPick={pickStep} />
            {hasFootnotes && (
              <div className="wt-figfoots">
                {steps.map((item, i) => (
                  <p key={item.id} className="wt-figfoot wt-readout" data-current={i === idx ? '' : undefined} aria-hidden={i === idx ? undefined : 'true'}>
                    {readoutOf(item)}
                  </p>
                ))}
              </div>
            )}
          </div>

          <div
            ref={readoutRef}
            className="wt-ro"
            onPointerEnter={actions.onReadoutEnter}
            onPointerLeave={actions.onReadoutLeave}
          >
            {steps.flatMap((item, i) => {
              const here = i === idx;
              const showing = here && agent === null;
              // Only the open step is replayed (its key carries the run); the others sit still and unseen.
              const run = here ? runId : 'rest';
              const text = item.id === 'decision' && decision ? fill(labels.recorded, { kind: decision }) : labels.waiting;
              const panel = (
                <div key={item.id} className="wt-ro-step" data-current={showing ? '' : undefined} aria-hidden={showing ? undefined : 'true'}>
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
                  {typeof item.person === 'string' && (
                    <p key={`p-${run}`} className="wt-ro-person wt-in" style={{ '--i': 2 }}>
                      <b>{labels.person} </b>
                      {item.person}
                    </p>
                  )}
                  {item.rule && (
                    <p key={`r-${run}`} className="wt-ro-rule wt-in" style={{ '--i': 2 }}>
                      {item.rule}
                    </p>
                  )}
                  {Array.isArray(item.agents) && (
                    <>
                      <p key={`w-${run}`} className="wt-ro-who wt-in" style={{ '--i': 3 }}>
                        {item.agents.length === 0 ? labels.who : item.agents.length === 1 ? labels.who : labels.whoInOrder}
                      </p>
                      {item.agents.length === 0 ? (
                        <p key={`n-${run}`} className="wt-ro-rule wt-in" style={{ '--i': 4 }}>
                          {labels.noAgents}
                        </p>
                      ) : (
                        <ul key={`l-${run}`} className="wt-roles wt-in" style={{ '--i': 4 }}>
                          {item.agents.map((who, ai) => (
                            <li key={who.name}>
                              <button type="button" className="wt-role" data-agent={ai} onClick={() => actions.openAgent(ai)}>
                                <span className="wt-role-n">{who.name}</span>
                                <span className="wt-role-kind">{who.kind}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
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
              if (!Array.isArray(item.agents)) return [panel];
              const cards = item.agents.map((who, ai) => {
                const open = here && agent === ai;
                return (
                  <div key={`${item.id}-agent-${ai}`} className="wt-ro-agent" data-current={open ? '' : undefined} aria-hidden={open ? undefined : 'true'}>
                    <Fragment key={open ? 'open' : 'rest'}>
                      <button type="button" className="wt-back wt-in" style={{ '--i': 0 }} onClick={actions.back}>
                        {fill(labels.backTo, { label: item.label })}
                      </button>
                      <p className="wt-ro-k wt-in" style={{ '--i': 1 }}>
                        {who.name}
                        <span className="wt-tag" data-tag={who.kind}>
                          {who.kind}
                        </span>
                      </p>
                      <p className="wt-ro-does wt-in" style={{ '--i': 2 }}>
                        {who.role}
                      </p>
                      <dl className="wt-rw">
                        {who.reads && (
                          <div className="wt-in" style={{ '--i': 3 }}>
                            <dt>{labels.reads}</dt>
                            <dd>{who.reads}</dd>
                          </div>
                        )}
                        {who.writes && (
                          <div className="wt-in" style={{ '--i': 4 }}>
                            <dt>{labels.writes}</dt>
                            <dd className="wt-rw-files">{who.writes}</dd>
                          </div>
                        )}
                        <div className="wt-in" style={{ '--i': 5 }}>
                          <dt>{labels.next}</dt>
                          <dd>{who.next}</dd>
                        </div>
                      </dl>
                    </Fragment>
                  </div>
                );
              });
              return [panel, ...cards];
            })}
          </div>
        </div>

        <div className="wt-controls">
          {clickDriven ? (
            <>
              <button type="button" className="wt-ctl" aria-disabled={idx === 0 ? 'true' : undefined} onClick={idx === 0 ? undefined : actions.previous}>
                {controls.prev}
              </button>
              <button type="button" className="wt-ctl" aria-disabled={ended ? 'true' : undefined} onClick={ended ? undefined : actions.next}>
                {controls.next}
              </button>
            </>
          ) : (
            <>
              <button type="button" className="wt-ctl" hidden={calm || ended || waiting} onClick={actions.togglePlay}>
                {walk.playing ? controls.pause : controls.play}
              </button>
              <button type="button" className="wt-ctl" hidden={ended} onClick={actions.next}>
                {controls.next}
              </button>
            </>
          )}
          <p className="wt-hint" data-show={waiting || clickDriven ? '' : undefined} aria-hidden={waiting || clickDriven ? undefined : 'true'}>
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
              {item.rule && <p className="wt-d wt-rule">{item.rule}</p>}
              {typeof item.person === 'string' && (
                <p className="wt-p">
                  {labels.personInList} {item.person}
                </p>
              )}
              {item.agents?.length > 0 && <p className="wt-who">{item.agents.map((who) => who.name).join(' \u00b7 ')}</p>}
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
