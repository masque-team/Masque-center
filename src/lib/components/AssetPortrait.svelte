<script lang="ts">
  let {
    src,
    alt,
    placeholder,
    kind,
    className = '',
    style = '',
  }: {
    src: string;
    alt: string;
    placeholder: string;
    kind: 'avatar' | 'pet';
    className?: string;
    style?: string;
  } = $props();

  let failed = $state(false);

  $effect(() => {
    src;
    failed = false;
  });
</script>

<span class={`asset-portrait ${kind} ${className}`} {style} role="img" aria-label={alt}>
  {#if !failed}
    <img {src} {alt} onerror={() => (failed = true)} />
  {:else}
    <span class="asset-placeholder" aria-hidden="true">{placeholder}</span>
  {/if}
</span>