<script lang="ts">
	import type { BuildingKillVodEvent } from '../../lib/types';
	import { twitchEventBus } from '../../lib/store';

	let { event }: { event: BuildingKillVodEvent } = $props();

	function jumpToTimestamp() {
		twitchEventBus.emit(event.offsetSeconds);
	}

	function getBuildingDisplay(): string {
		if (event.buildingType === 'TOWER_BUILDING' && event.towerType) {
			return `${event.towerType.replace('_', ' ')} (${event.laneType.replace('_', ' ')})`;
		}
		return `${event.buildingType.replace('_', ' ')} (${event.laneType.replace('_', ' ')})`;
	}
</script>

<div class="bg-gradient-to-br from-indigo-900/30 to-blue-900/30 backdrop-blur-sm border border-indigo-500/30 rounded-xl p-4 shadow-lg">
	<div class="flex items-center justify-between mb-3">
		<div class="flex items-center gap-3">
			<div class="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center">
				<span class="text-white text-sm">🏰</span>
			</div>
			<h3 class="font-bold text-indigo-200">Building Destroyed</h3>
		</div>
		<div class="flex items-center gap-2">
			<span class="text-xs px-3 py-1 rounded-full font-medium {event.isStreamerTeam ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}">
				{event.isStreamerTeam ? '🛡️ Allied' : '⚔️ Enemy'}
			</span>
		</div>
	</div>
	
	<div class="bg-indigo-900/20 p-3 rounded-lg border border-indigo-500/20 mb-3">
		<p class="text-sm text-indigo-100 font-medium">
			{getBuildingDisplay()} has been destroyed
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
	
	<button 
		onclick={jumpToTimestamp}
		class="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
	>
		🎯 Jump to Moment
	</button>
</div>
