<script lang="ts">
	let { offsetSeconds }: { offsetSeconds: number } = $props();

	function formatTimestamp(offsetSeconds: number): string {
		const hours = Math.floor(offsetSeconds / 3600);
		const minutes = Math.floor((offsetSeconds % 3600) / 60);
		const seconds = Math.floor(offsetSeconds % 60);
		
		if (hours > 0) {
			return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
		}
		return `${minutes}:${seconds.toString().padStart(2, '0')}`;
	}
</script>

<span class="font-mono text-sm">
	{formatTimestamp(offsetSeconds)}
</span>
