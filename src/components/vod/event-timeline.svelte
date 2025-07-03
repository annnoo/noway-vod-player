<script lang="ts">
	import type { VodEvent } from '../../lib/types';
	import { VodEventType } from '../../lib/types';
	import { currentTimeStore, autoScrollStore, autoScrollEnabledStore, twitchEventBus } from '../../lib/store';
	import { onMount } from 'svelte';
	import GameEventComponent from './game-event.svelte';
	import SongEventComponent from './song-event.svelte';
	import ChampionKillEventComponent from './champion-kill-event.svelte';
	import ChampionDeathEventComponent from './champion-death-event.svelte';
	import ChampionAssistEventComponent from './champion-assist-event.svelte';
	import ChampionSpecialKillEventComponent from './champion-special-kill-event.svelte';
	import EliteMonsterKillEventComponent from './elite-monster-kill-event.svelte';
	import BuildingKillEventComponent from './building-kill-event.svelte';
	import GameEndEventComponent from './game-end-event.svelte';

	let { events }: { events: VodEvent[] } = $props();

	// Sort events by timestamp
	let sortedEvents = events.sort((a, b) => a.offsetSeconds - b.offsetSeconds);
	let eventsContainer: HTMLDivElement;
	let lastScrolledEventId = '';
	let autoScrollEnabled = $state(true);

	// Subscribe to auto-scroll enabled state
	autoScrollEnabledStore.subscribe((enabled) => {
		autoScrollEnabled = enabled;
	});

	function formatTimestamp(offsetSeconds: number): string {
		const hours = Math.floor(offsetSeconds / 3600);
		const minutes = Math.floor((offsetSeconds % 3600) / 60);
		const seconds = Math.floor(offsetSeconds % 60);
		
		if (hours > 0) {
			return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
		}
		return `${minutes}:${seconds.toString().padStart(2, '0')}`;
	}

	function findLatestEvent(currentTime: number): VodEvent | null {
		// Find the most recent event that has already occurred (with a small buffer)
		const eventsBeforeCurrentTime = sortedEvents.filter(event => event.offsetSeconds <= currentTime + 2);
		const latestEvent = eventsBeforeCurrentTime.length > 0 ? eventsBeforeCurrentTime[eventsBeforeCurrentTime.length - 1] : null;
		
		console.log('Current time:', currentTime);
		console.log('Events before current time:', eventsBeforeCurrentTime.length);
		console.log('Latest event:', latestEvent?.id, 'at', latestEvent?.offsetSeconds);
		
		return latestEvent;
	}

	function scrollToEvent(eventId: string) {
		if (!eventsContainer || eventId === lastScrolledEventId) {
			console.log('Skipping scroll - container missing or same event:', eventId);
			return;
		}
		
		const eventElement = eventsContainer.querySelector(`[data-event-id="${eventId}"]`);
		console.log('Found event element:', !!eventElement, 'for ID:', eventId);
		
		if (eventElement) {
			console.log('Scrolling to event:', eventId);
			eventElement.scrollIntoView({
				behavior: 'smooth',
				block: 'start'
			});
			lastScrolledEventId = eventId;
		} else {
			console.warn('Could not find event element with ID:', eventId);
		}
	}

	// Listen to current time updates and auto-scroll
	currentTimeStore.subscribe((currentTime) => {
		if (currentTime > 0 && autoScrollEnabled) {
			const latestEvent = findLatestEvent(currentTime);
			if (latestEvent && latestEvent.id !== lastScrolledEventId) {
				scrollToEvent(latestEvent.id);
			}
		}
	});

	// Listen to manual scroll requests
	autoScrollStore.subscribe((eventId) => {
		if (eventId) {
			scrollToEvent(eventId);
		}
	});
    function seekToTs(event: VodEvent) {
        twitchEventBus.emit(event.offsetSeconds);
    }
</script>

<div class="h-full flex flex-col">
	<!-- Sticky Header -->
	<div class="sticky top-0 bg-white z-10 border-b border-gray-200 pb-4 mb-4">
		<div class="flex items-center justify-between">
			<h2 class="text-2xl font-bold">Event Timeline</h2>
			<div class="flex items-center gap-2">
				<label class="flex items-center gap-2 text-sm cursor-pointer">
					<input 
						type="checkbox" 
						bind:checked={autoScrollEnabled}
						onchange={() => autoScrollEnabledStore.set(autoScrollEnabled)}
						class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
					/>
					<span class="select-none">Auto-scroll</span>
				</label>
			</div>
		</div>
	</div>

	<!-- Scrollable Events Container -->
	<div bind:this={eventsContainer} class="flex-1 space-y-4 overflow-y-auto">
		{#if sortedEvents.length === 0}
			<div class="text-center py-8">
				<p class="text-gray-500">No events found for this VOD.</p>
			</div>
		{:else}
			{#each sortedEvents as event (event.id)}
				<div 
					data-event-id={event.id}
					class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow scroll-mt-4"
				>
					<div class="flex items-start justify-between mb-2">
					<button 
						type="button"
						class="text-sm font-medium text-blue-600 hover:underline italic hover:cursor-pointer"
						onclick={() => seekToTs(event)}
					>
						{formatTimestamp(event.offsetSeconds)}
					</button>
						<span class="text-xs text-gray-500 capitalize">
							{event.type.replace('_', ' ').toLowerCase()}
						</span> 
					</div>
					
					{#if event.type === VodEventType.GAME}
						<GameEventComponent {event} />
					{:else if event.type === VodEventType.SONG}
						<SongEventComponent {event} />
					{:else if event.type === VodEventType.CHAMPION_KILL}
						<ChampionKillEventComponent {event} />
					{:else if event.type === VodEventType.CHAMPION_DEATH}
						<ChampionDeathEventComponent {event} />
					{:else if event.type === VodEventType.CHAMPION_ASSIST}
						<ChampionAssistEventComponent {event} />
					{:else if event.type === VodEventType.CHAMPION_SPECIAL_KILL}
						<ChampionSpecialKillEventComponent {event} />
					{:else if event.type === VodEventType.ELITE_MONSTER_KILL}
						<EliteMonsterKillEventComponent {event} />
					{:else if event.type === VodEventType.BUILDING_KILL}
						<BuildingKillEventComponent {event} />
					{:else if event.type === VodEventType.GAME_END}
						<GameEndEventComponent {event} />
					{:else}
						<div class="text-sm">
							<h3 class="font-semibold">{event}</h3>
						</div>
					{/if}
				</div>
			{/each}
		{/if}
	</div>
</div>
