<script lang="ts">
	import type { GameEndVodEvent } from '../../lib/types';
	import { twitchEventBus } from '../../lib/store';

	let { event }: { event: GameEndVodEvent } = $props();

	function jumpToTimestamp() {
		twitchEventBus.emit(event.offsetSeconds);
	}
</script>

<div class="bg-slate-50 border-l-4 border-slate-400 p-3">
	<div class="flex items-center justify-between mb-2">
		<h3 class="font-semibold text-slate-900">🏁 Game End</h3>
		<span class="text-sm px-2 py-1 rounded {event.isStreamerTeamWinner ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
			{event.isStreamerTeamWinner ? 'Victory' : 'Defeat'}
		</span>
	</div>
	
	<p class="text-sm text-slate-800 mb-1">
		Game completed - {event.result}
	</p>
</div>
