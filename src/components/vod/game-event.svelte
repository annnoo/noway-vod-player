<script lang="ts">
	import type { GameEvent } from '../../lib/types';
	import { twitchEventBus } from '../../lib/store';

	let { event }: { event: GameEvent } = $props();

	function jumpToTimestamp() {
		twitchEventBus.emit(event.offsetSeconds);
	}

	function formatDuration(seconds: number): string {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}m ${remainingSeconds}s`;
	}
</script>

<div class="bg-blue-50 border-l-4 border-blue-400 p-3">
	<div class="flex items-center justify-between mb-2">
		<h3 class="font-semibold text-blue-900">Game: {event.championName}</h3>
		<span class="text-sm px-2 py-1 rounded {event.won ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
			{event.won ? 'Victory' : 'Defeat'}
		</span>
	</div>
	
	<p class="text-sm text-blue-800 mb-2">{event.title}</p>
	
	<div class="flex flex-wrap gap-2 text-xs text-blue-700">
		<span>Duration: {formatDuration(event.duration)}</span>
		{#if event.kills !== undefined && event.deaths !== undefined && event.assists !== undefined}
			<span>KDA: {event.kills}/{event.deaths}/{event.assists}</span>
		{/if}
	</div>
</div>
