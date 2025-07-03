<script lang="ts">
	import { twitchEventBus, currentTimeStore } from '../../lib/store';
	import { onDestroy } from 'svelte';
	
	let {
		channel,
		width = '100%',
		height = '100%',
		autoplay,
		muted,
		id,
		video
	}: {
		channel?: string;
		width?: string | number;
		height?: string | number;
		autoplay?: boolean;
		muted?: boolean;
		id?: string;
		video?: string;
	} = $props();

	let player: Twitch.Player;
	let timeInterval: number;

	$effect(() => {
		const playerId = id || 'default';
		player = new Twitch.Player(`twitch-embed-${playerId}`, {
			video,
			width,
			height,
			autoplay,
			muted,
			parent: []
		});

		// Start tracking current time every 4 seconds
		timeInterval = setInterval(() => {
			if (player && typeof player.getCurrentTime === 'function') {
				try {
					const currentTime = player.getCurrentTime();
					console.log('Current player time:', currentTime);
					currentTimeStore.update(currentTime);
				} catch (error) {
					console.warn('Could not get current time from Twitch player:', error);
				}
			} else {
				console.warn('Player not ready or getCurrentTime not available');
			}
		}, 4000) as any as number; 

		return () => {
			if (timeInterval) {
				clearInterval(timeInterval);
			}
		};
	});

	onDestroy(() => {
		if (timeInterval) {
			clearInterval(timeInterval);
		}
	});

	twitchEventBus.subscribe((event) => {
		if (event && player) {
			(player as any).seek(event);
		}
	});
</script>
<div id={`twitch-embed-${id || 'default'}`} class="twitch-embed"></div>

<style>
	.twitch-embed {
		aspect-ratio: 16/9;
		position: relative;
	}

	.live-marker {
		position: absolute;
		top: 0;
		right: 0.5rem;
		z-index: 1;
	}
</style>
