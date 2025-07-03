<script lang="ts">
	import type { ChampionSpecialKillVodEvent } from '../../lib/types';
	import { twitchEventBus } from '../../lib/store';
	import { getChampionImageUrl } from '../../lib/championUtils';

	let { event }: { event: ChampionSpecialKillVodEvent } = $props();

	function jumpToTimestamp() {
		twitchEventBus.emit(event.offsetSeconds);
	}

	function getKillTypeDisplay(killType: string, multiKillLength?: number): string {
		switch (killType) {
			case 'KILL_MULTI':
				return `${multiKillLength}x Multi Kill`;
			case 'KILL_ACE':
				return 'Ace';
			case 'KILL_FIRST_BLOOD':
				return 'First Blood';
			default:
				return killType.replace('KILL_', '').toLowerCase();
		}
	}
</script>

<div class="bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4 shadow-lg">
	<div class="flex items-center justify-between mb-3">
		<div class="flex items-center gap-3">
			<div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
				<span class="text-white text-sm">✨</span>
			</div>
			<h3 class="font-bold text-purple-200">Special Kill</h3>
		</div>
		<div class="flex items-center gap-2">
			<span class="text-xs bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full border border-purple-500/30 font-medium">
				🌟 {getKillTypeDisplay(event.killType, event.multiKillLength)}
			</span>
		</div>
	</div>
	
	<div class="bg-purple-900/20 p-3 rounded-lg border border-purple-500/20 mb-3">
		<div class="flex items-center gap-3">
			<img 
				src={getChampionImageUrl(event.championId)} 
				alt={event.championName}
				class="w-10 h-10 rounded-full border-2 border-purple-400/50 shadow-lg"
			/>
			<div>
				<p class="text-sm text-purple-100">
					<span class="font-semibold text-purple-200">{event.championName}</span> 
					<span class="text-purple-300">achieved a special kill</span>
				</p>
			</div>
		</div>
	</div>
	
	<button 
		onclick={jumpToTimestamp}
		class="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
	>
		🎯 Jump to Highlight
	</button>
</div>
