<script lang="ts">
	import type { ChampionDeathVodEvent } from '../../lib/types';
	import { twitchEventBus } from '../../lib/store';

	let { event }: { event: ChampionDeathVodEvent } = $props();

	function jumpToTimestamp() {
		twitchEventBus.emit(event.offsetSeconds);
	}
</script>

<div class="bg-gray-50 border-l-4 border-gray-400 p-3">
	<div class="flex items-center justify-between mb-2">
		<h3 class="font-semibold text-gray-900">💀 Champion Death</h3>
	</div>
	
	<p class="text-sm text-gray-800 mb-1">
		{event.championName} killed by {event.killerChampionName}
	</p>
</div>
