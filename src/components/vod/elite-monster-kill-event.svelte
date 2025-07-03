<script lang="ts">
	import type { EliteMonsterKillVodEvent } from '../../lib/types';
	import { twitchEventBus } from '../../lib/store';

	let { event }: { event: EliteMonsterKillVodEvent } = $props();

	function jumpToTimestamp() {
		twitchEventBus.emit(event.offsetSeconds);
	}
</script>

<div class="bg-gradient-to-br from-orange-900/30 to-red-900/30 backdrop-blur-sm border border-orange-500/30 rounded-xl p-4 shadow-lg">
	<div class="flex items-center justify-between mb-3">
		<div class="flex items-center gap-3">
			<div class="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
				<span class="text-white text-sm">🐉</span>
			</div>
			<h3 class="font-bold text-orange-200">Elite Monster Kill</h3>
		</div>
		<div class="flex items-center gap-2">
			<span class="text-xs px-3 py-1 rounded-full font-medium {event.isStreamerTeam ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}">
				{event.isStreamerTeam ? '🛡️ Allied' : '⚔️ Enemy'}
			</span>
		</div>
	</div>
	
	<div class="bg-orange-900/20 p-3 rounded-lg border border-orange-500/20 mb-3">
		<p class="text-sm text-orange-100 font-medium">
			<span class="text-orange-200">{event.monsterName}</span> has been slain
		</p>
		
		{#if event.bounty > 0}
			<div class="flex items-center gap-2 mt-2 bg-yellow-900/20 p-2 rounded-lg">
				<span class="text-yellow-400">💰</span>
				<span class="text-xs text-yellow-200 font-medium">
					Bounty: {event.bounty} gold
				</span>
			</div>
		{/if}
	</div>
</div>
