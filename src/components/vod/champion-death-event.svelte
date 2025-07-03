<script lang="ts">
	import type { ChampionDeathVodEvent } from '../../lib/types';
	import { twitchEventBus } from '../../lib/store';

	let { event }: { event: ChampionDeathVodEvent } = $props();

	function jumpToTimestamp() {
		twitchEventBus.emit(event.offsetSeconds);
	}
</script>

<div class="bg-gradient-to-br from-gray-900/30 to-slate-900/30 backdrop-blur-sm border border-gray-500/30 rounded-xl p-4 shadow-lg">
	<div class="flex items-center justify-between mb-3">
		<div class="flex items-center gap-3">
			<div class="w-8 h-8 bg-gradient-to-br from-gray-500 to-slate-500 rounded-lg flex items-center justify-center">
				<span class="text-white text-sm">💀</span>
			</div>
			<h3 class="font-bold text-gray-200">Champion Death</h3>
		</div>
		<div class="w-3 h-3 bg-gray-400 rounded-full opacity-60"></div>
	</div>
	
	<div class="bg-gray-900/20 p-3 rounded-lg border border-gray-500/20">
		<p class="text-sm text-gray-100">
			<span class="font-semibold text-gray-200">{event.championName}</span> 
			<span class="text-gray-300">was eliminated by</span> 
			<span class="font-semibold text-gray-200">{event.killerChampionName}</span>
		</p>
	</div>
</div>
