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
		console.log('Latest event:',latestEvent?.title, latestEvent?.id, 'at', latestEvent?.offsetSeconds);
		
		return latestEvent;
	}

	function scrollToEvent(eventId: string) {

        		const eventElement = eventsContainer.querySelector(`[data-event-id="${eventId}"]`);
		
		console.log('Found event element:', eventElement, 'for ID:', eventId);
		
		if (eventElement) {
			console.log('Scrolling to event:', eventId);
            // If the event is not in the view, but was the previous event - scroll again
            if (eventId === lastScrolledEventId) {
                console.log("Check positioning")
                // If teh element is visible, do not scroll again
                const rect = eventElement.getBoundingClientRect();
                if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
                    console.log('Event element is already in view, skipping scroll');
                    return;
                }

            }

            
			eventElement.scrollIntoView({
				behavior: 'smooth',
			});
            setTimeout(() => {
                // Ensure the event is fully visible after scroll

                    eventElement.scrollIntoView({ behavior: 'smooth'});
            }, 100); // Small delay to ensure scroll completes
			lastScrolledEventId = eventId;
		} else {
			console.warn('Could not find event element with ID:', eventId);
		}
	}

	// Listen to current time updates and auto-scroll
	currentTimeStore.subscribe((currentTime) => {
		if (currentTime > 0 && autoScrollEnabled) {
			const latestEvent = findLatestEvent(currentTime);
			if (latestEvent && latestEvent.id) {
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
	<div class="sticky p-5 top-0 bg-gray-900/90 backdrop-blur-sm z-10 border-b pb-4 -mb-1 rounded-t-xl border-transparent">
		<div class="flex items-center justify-between">
			<h2 class="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
				⚡ Event Timeline
			</h2>
			<div class="flex items-center gap-2">
				<label class="flex items-center gap-2 text-sm cursor-pointer group">
					<input 
						type="checkbox" 
						bind:checked={autoScrollEnabled}
						onchange={() => autoScrollEnabledStore.set(autoScrollEnabled)}
						class="rounded border-gray-600 bg-gray-800 text-purple-500 focus:ring-purple-500 focus:ring-2 transition-all"
					/>
					<span class="select-none text-gray-300 group-hover:text-white transition-colors">
						🎯 Auto-scroll
					</span>
				</label>
			</div>
		</div>
	</div>

	<!-- Scrollable Events Container -->
	<div bind:this={eventsContainer} class="flex-1 space-y-4 overflow-y-auto p-4 bg-gray-900/90" >
		{#if sortedEvents.length === 0}
			<div class="text-center py-12">
				<div class="w-16 h-16 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
					<span class="text-gray-400 text-2xl">📭</span>
				</div>
				<p class="text-gray-400 text-lg">No events found for this VOD.</p>
			</div>
		{:else}
			{#each sortedEvents as event (event.id)}
				<div 
					data-event-id={event.id}
					class="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 hover:bg-gray-800/60 hover:border-gray-600/50 transition-all duration-300 scroll-mt-4 shadow-lg"
				>
					<div class="flex items-start justify-between mb-3">
						<button 
							type="button"
							class="text-sm hover:underline hover:cursor-pointer  font-mono font-medium text-purple-400 hover:text-purple-300 bg-purple-900/20 hover:bg-purple-900/40 px-3 py-1 rounded-lg transition-all duration-200 transform hover:scale-105"
							onclick={() => seekToTs(event)}
						>
							{formatTimestamp(event.offsetSeconds)}
						</button>
						<span class="text-xs text-gray-500 capitalize bg-gray-900/50 px-2 py-1 rounded-full">
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
							<h3 class="font-semibold text-gray-300">{event}</h3>
						</div>
					{/if}
				</div>
			{/each}
		{/if}
	</div>
</div>
