<script lang="ts">
	import type { GameEvent } from '../../lib/types';
	import { twitchEventBus } from '../../lib/store';
	import { getChampionImageUrl } from '../../lib/championUtils';

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

<div class="bg-gradient-to-br from-blue-900/30 to-purple-900/30 backdrop-blur-sm border border-blue-500/30 rounded-xl p-4 shadow-lg">
	<div class="flex items-center justify-between mb-3">
		<div class="flex items-center gap-3">
			<div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
				<span class="text-white text-sm font-bold">🎮</span>
			</div>
			<h3 class="font-bold text-blue-200">Game: {event.championName}</h3>
		</div>
		<div class="flex items-center gap-2">
			<span class="text-sm px-3 py-1 rounded-full font-medium {event.won ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}">
				{event.won ? '🏆 Victory' : '💀 Defeat'}
			</span>
		</div>
	</div>
	
	<p class="text-sm text-blue-100 mb-3 bg-blue-900/20 p-2 rounded-lg">{event.title}</p>
	
	<div class="flex flex-wrap gap-3 text-sm text-blue-200">
		<div class="flex items-center gap-1 bg-blue-900/30 px-2 py-1 rounded-lg">
			<span>⏱️</span>
			<span>Duration: {formatDuration(event.duration)}</span>
		</div>
		{#if event.kills !== undefined && event.deaths !== undefined && event.assists !== undefined}
			<div class="flex items-center gap-1 bg-purple-900/30 px-2 py-1 rounded-lg">
				<span>⚔️</span>
				<span>KDA: {event.kills}/{event.deaths}/{event.assists}</span>
			</div>
		{/if}
	</div>
</div>
