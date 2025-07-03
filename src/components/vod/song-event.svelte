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

<div class="bg-gradient-to-br from-green-900/30 to-emerald-900/30 backdrop-blur-sm border border-green-500/30 rounded-xl p-4 shadow-lg">
	<div class="flex items-center justify-between mb-3">
		<div class="flex items-center gap-3">
			<div class="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
				<span class="text-white text-sm">🎵</span>
			</div>
			<h3 class="font-bold text-green-200">{event.title}</h3>
		</div>
		<div class="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
	</div>
	
	<p class="text-sm text-green-100 mb-2 bg-green-900/20 p-2 rounded-lg">by {event.artist}</p>
	
	{#if event.album}
		<p class="text-xs text-green-300 mb-3 opacity-75">Album: {event.album}</p>
	{/if}
	
	<div class="flex flex-col gap-3 mt-3">
		{#if event.spotifyUrl}
			<div class="bg-green-900/20 rounded-lg p-3 border border-green-500/20">
				<Spotify spotifyLink={spotifyUrlForEmbed} />
			</div>
			<a 
				href={event.spotifyUrl} 
				target="_blank" 
				rel="noopener noreferrer"
				class="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
			>
				<span>🎧</span>
				<span>Listen on Spotify</span>
			</a>
		{/if}
	</div>
</div>
