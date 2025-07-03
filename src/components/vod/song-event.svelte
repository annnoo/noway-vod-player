<script lang="ts">
	import type { SongEvent } from '../../lib/types';
	import { twitchEventBus } from '../../lib/store';
import Spotify from '../svelte/spotify.svelte'
	let { event }: { event: SongEvent } = $props();

    let spotifyUrlForEmbed = event.spotifyUrl?.split('https://open.spotify.com/')[1]
	function jumpToTimestamp() {
		twitchEventBus.emit(event.offsetSeconds);
	}
</script>

<div class="bg-green-50 border-l-4 border-green-400 p-3">
	<div class="flex items-center justify-between mb-2">
		<h3 class="font-semibold text-green-900">🎵 {event.title}</h3>
	</div>
	
	<p class="text-sm text-green-800 mb-1">by {event.artist}</p>
	
	{#if event.album}
		<p class="text-xs text-green-700 mb-2">Album: {event.album}</p>
	{/if}
	
	<div class="flex flex-col gap-2 mt-2">
		{#if event.spotifyUrl}
        <Spotify
        spotifyLink={spotifyUrlForEmbed} ></Spotify>
			<a 
				href={event.spotifyUrl} 
				target="_blank" 
				rel="noopener noreferrer"
				class="text-xs bg-green-600 h-20 self-center text-center  text-white px-2 py-1 rounded hover:bg-green-700"
			>
				Link To Spotify
			</a>
		{/if}
	</div>
</div>
