<script lang="ts">
	import type { ChampionKillVodEvent } from '../../lib/types';
	import { twitchEventBus } from '../../lib/store';

	let { event }: { event: ChampionKillVodEvent } = $props();

	function jumpToTimestamp() {
		twitchEventBus.emit(event.offsetSeconds);
	}
</script>

<div class="bg-gradient-to-br from-red-900/30 to-rose-900/30 backdrop-blur-sm border border-red-500/30 rounded-xl p-4 shadow-lg">
	<div class="flex items-center justify-between mb-3">
		<div class="flex items-center gap-3">
			<div class="w-8 h-8 bg-gradient-to-br from-red-500 to-rose-500 rounded-lg flex items-center justify-center">
				<span class="text-white text-sm">⚔️</span>
			</div>
			<h3 class="font-bold text-red-200">Champion Kill</h3>
		</div>
		{#if event.killStreakLength > 1}
			<div class="flex items-center gap-2">
				<span class="text-xs bg-red-500/20 text-red-300 px-3 py-1 rounded-full border border-red-500/30 font-medium">
					🔥 {event.killStreakLength} Kill Streak
				</span>
			</div>
		{/if}
	</div>
	
	<div class="bg-red-900/20 p-3 rounded-lg border border-red-500/20">
		<p class="text-sm text-red-100">
			<span class="font-semibold text-red-200">{event.championName}</span> 
			<span class="text-red-300">eliminated</span> 
			<span class="font-semibold text-red-200">{event.victimChampionName}</span>
		</p>
	</div>
</div>
