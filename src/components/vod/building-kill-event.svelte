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

<div class="bg-indigo-50 border-l-4 border-indigo-400 p-3">
	<div class="flex items-center justify-between mb-2">
		<h3 class="font-semibold text-indigo-900">🏰 Building Destroyed</h3>
		<span class="text-xs px-2 py-1 rounded {event.isStreamerTeam ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
			{event.isStreamerTeam ? 'Allied' : 'Enemy'}
		</span>
	</div>
	
	<p class="text-sm text-indigo-800 mb-1">
		{getBuildingDisplay()} destroyed
	</p>
	
	{#if event.bounty > 0}
		<p class="text-xs text-indigo-700 mb-2">
			Bounty: {event.bounty} gold
		</p>
	{/if}
	
	<button 
		onclick={jumpToTimestamp}
		class="mt-2 text-xs text-indigo-600 hover:text-indigo-800 hover:underline"
	>
		Jump to timestamp
	</button>
</div>
