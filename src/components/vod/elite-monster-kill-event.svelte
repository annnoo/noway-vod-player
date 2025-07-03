<script lang="ts">
	import type { EliteMonsterKillVodEvent } from '../../lib/types';
	import { twitchEventBus } from '../../lib/store';

	let { event }: { event: EliteMonsterKillVodEvent } = $props();

	function jumpToTimestamp() {
		twitchEventBus.emit(event.offsetSeconds);
	}
</script>

<div class="bg-orange-50 border-l-4 border-orange-400 p-3">
	<div class="flex items-center justify-between mb-2">
		<h3 class="font-semibold text-orange-900">🐉 Elite Monster Kill</h3>
		<span class="text-xs px-2 py-1 rounded {event.isStreamerTeam ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
			{event.isStreamerTeam ? 'Allied' : 'Enemy'}
		</span>
	</div>
	
	<p class="text-sm text-orange-800 mb-1">
		{event.monsterName} killed
	</p>
	
	{#if event.bounty > 0}
		<p class="text-xs text-orange-700 mb-2">
			Bounty: {event.bounty} gold
		</p>
	{/if}
</div>
