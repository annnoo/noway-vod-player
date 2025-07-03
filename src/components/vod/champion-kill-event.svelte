<script lang="ts">
	import type { ChampionKillVodEvent } from '../../lib/types';
	import { twitchEventBus } from '../../lib/store';

	let { event }: { event: ChampionKillVodEvent } = $props();

	function jumpToTimestamp() {
		twitchEventBus.emit(event.offsetSeconds);
	}
</script>

<div class="bg-red-50 border-l-4 border-red-400 p-3">
	<div class="flex items-center justify-between mb-2">
		<h3 class="font-semibold text-red-900">⚔️ Champion Kill</h3>
		{#if event.killStreakLength > 1}
			<span class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
				{event.killStreakLength} Kill Streak
			</span>
		{/if}
	</div>
	
	<p class="text-sm text-red-800 mb-1">
		{event.championName} killed {event.victimChampionName}
	</p>
</div>
