<script lang="ts">
	import type { ChampionAssistVodEvent } from '../../lib/types';
	import { twitchEventBus } from '../../lib/store';

	let { event }: { event: ChampionAssistVodEvent } = $props();

	function jumpToTimestamp() {
		twitchEventBus.emit(event.offsetSeconds);
	}
</script>

<div class="bg-yellow-50 border-l-4 border-yellow-400 p-3">
	<div class="flex items-center justify-between mb-2">
		<h3 class="font-semibold text-yellow-900">🤝 Champion Assist</h3>
	</div>
	
	<p class="text-sm text-yellow-800 mb-1">
		{event.championName} assisted {event.killerChampionName} in killing {event.victimChampionName}
	</p>
</div>
