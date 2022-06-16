import React, { useEffect, useRef, useState } from 'react';
import postParticles from './common/postParticles';
import NewWindowComponent from './NewWindowComponent';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import fetchParticles, { autoFetch } from './common/fetchParticles';

export default function ParticleLocator({
  setParticles,
  locationInProgress,
  setLocationInProgress,
  interval,
  setInterval,
  setReplayLoad
}) {
  const [split, setSplit] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [particleName, setParticleName] = useState(null);
  const [isNewWindow, setIsNewWindow] = useState(false);
  const particlesStateToRestore = useRef([]);

  useEffect(() => {
    if (split === null) return;

    async function post() {
      const stateChanged = split.entries1.map(([key, value]) => [key, !value]);
      const json = Object.fromEntries(stateChanged);
      split.entries1 = stateChanged;
      await postParticles(json, setParticles);
    }

    setIsLoading(true);
    void post().then(() => setIsLoading(false));
  }, [split, setParticles]);

  async function findParticle(entries) {
    if (entries.length === 1) {
      clearInterval(interval);
      setInterval(autoFetch(setParticles, setReplayLoad, 10000));
      return stopLocating(entries);
    }

    setSplit({
      entries1: entries.slice(0, entries.length / 2),
      entries2: entries.slice(entries.length / 2)
    });
  }

  async function handleParticleLocator() {
    if (locationInProgress === true) {
      clearInterval(interval);
      setInterval(autoFetch(setParticles, setReplayLoad, 10000));
      return stopLocating();
    }

    clearInterval(interval);
    const fetchedParticles = await fetchParticles(setParticles, setReplayLoad);
    particlesStateToRestore.current = fetchedParticles;
    setParticleName(null);
    setLocationInProgress(true);
    return findParticle(Object.entries(fetchedParticles));
  }

  async function stopLocating(entries) {
    await postParticles(particlesStateToRestore.current, setParticles);
    setParticles(particlesStateToRestore.current);
    if (entries !== undefined) {
      setParticleName(entries[0][0]);
    }
    setLocationInProgress(false);
  }

  return (
    <>
      <button
        type="button"
        className="btn btn-slate btn-responsive sm:mb-4 mb-1"
        onClick={() => setIsNewWindow(true)}
      >
        <FontAwesomeIcon className="mr-1 initial" icon="fa-solid fa-crosshairs" size="lg" />
        Particle Locator
      </button>
      {isNewWindow === true && (
        <NewWindowComponent
          onClose={() => {
            setIsNewWindow(false);
            if (locationInProgress) void stopLocating();
          }}
        >
          <div className="">
            <button
              type="button"
              className="btn btn-slate h-12 text-xl mt-2 sm:mb-4 mb-1"
              onClick={handleParticleLocator}
            >
              {locationInProgress === false ? 'Start' : 'Stop'}
            </button>
            {locationInProgress === true ? (
              <>
                <div className="mb-2 text-xl">Did change?</div>
                <div className="flex gap-6 justify-center">
                  <button
                    type="button"
                    className="btn btn-slate w-16 h-16 text-xl disabled:bg-slate-800"
                    onClick={() => findParticle(split.entries1)}
                    disabled={isLoading || !locationInProgress}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    className="btn btn-slate w-16 h-16 text-xl disabled:bg-slate-800"
                    onClick={() => findParticle(split.entries2)}
                    disabled={isLoading || !locationInProgress}
                  >
                    No
                  </button>
                </div>
              </>
            ) : null}
            {particleName !== null ? (
              <>
                <div className="mb-9">
                  <p>Particle name: </p>
                  <span className="font-bold">{particleName}</span>
                </div>
                <button
                  type="button"
                  className="block ml-auto mr-auto btn btn-slate"
                  onClick={() => postParticles({ [particleName]: false }, setParticles)}
                >
                  Disable particle
                </button>
              </>
            ) : null}
          </div>
        </NewWindowComponent>
      )}
    </>
  );
}
