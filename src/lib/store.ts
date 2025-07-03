import { writable } from 'svelte/store';

function createEventBus() {
  const { subscribe, set } = writable(0);

  return {
    subscribe,
    emit: (event: number) => set(event),
  };
}

function createCurrentTimeStore() {
  const { subscribe, set } = writable(0);

  return {
    subscribe,
    update: (time: number) => set(time),
  };
}

function createAutoScrollStore() {
  const { subscribe, set } = writable('');

  return {
    subscribe,
    scrollToEvent: (eventId: string) => set(eventId),
  };
}

function createAutoScrollEnabledStore() {
  const { subscribe, set, update } = writable(true);

  return {
    subscribe,
    toggle: () => update(enabled => !enabled),
    set: (enabled: boolean) => set(enabled),
  };
}

export const twitchEventBus = createEventBus();
export const currentTimeStore = createCurrentTimeStore();
export const autoScrollStore = createAutoScrollStore();
export const autoScrollEnabledStore = createAutoScrollEnabledStore();
