<script lang="ts">
	import type { ChampionAssistVodEvent } from '../../lib/types';
	import { twitchEventBus } from '../../lib/store';

	let { event }: { event: ChampionAssistVodEvent } = $props();
	
	const assistImageUrl = `https://cdn.nowaycdn.com/images/champions/square/16x/${event.championId}.png`;
	const killerImageUrl = `https://cdn.nowaycdn.com/images/champions/square/16x/${event.killerChampionId}.png`;
	const victimImageUrl = `https://cdn.nowaycdn.com/images/champions/square/16x/${event.victimChampionId}.png`;

	function jumpToTimestamp() {
		twitchEventBus.emit(event.offsetSeconds);
	}
</script>

<div class="bg-gradient-to-br from-yellow-900/30 to-amber-900/30 backdrop-blur-sm border border-yellow-500/30 rounded-xl p-4 shadow-lg">
	<div class="flex items-center justify-between mb-3">
		<div class="flex items-center gap-3">
			<div class="w-8 h-8 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-lg flex items-center justify-center">
				<span class="text-white text-sm">🤝</span>
			</div>
			<h3 class="font-bold text-yellow-200">Champion Assist</h3>
		</div>
		<div class="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
	</div>
	
	<div class="bg-yellow-900/20 p-3 rounded-lg border border-yellow-500/20">
		<p class="text-sm text-yellow-100">
			<span class="font-semibold text-yellow-200">{event.championName}</span> 
			<span class="text-yellow-300">assisted</span> 
			<span class="font-semibold text-yellow-200">{event.killerChampionName}</span>
			<span class="text-yellow-300">in eliminating</span>
			<span class="font-semibold text-yellow-200">{event.victimChampionName}</span>
		</p>
	</div>
</div>
