<script lang="ts">
	import type { ChampionSpecialKillVodEvent } from '../../lib/types';
	import { twitchEventBus } from '../../lib/store';

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

<div class="bg-purple-50 border-l-4 border-purple-400 p-3">
	<div class="flex items-center justify-between mb-2">
		<h3 class="font-semibold text-purple-900">✨ Special Kill</h3>
		<span class="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
			{getKillTypeDisplay(event.killType, event.multiKillLength)}
		</span>
	</div>
	
	<p class="text-sm text-purple-800 mb-1">
		{event.championName} got a special kill
	</p>
	
	<button 
		onclick={jumpToTimestamp}
		class="mt-2 text-xs text-purple-600 hover:text-purple-800 hover:underline"
	>
		Jump to timestamp
	</button>
</div>
