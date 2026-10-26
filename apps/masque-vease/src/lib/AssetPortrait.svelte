<script lang="ts">
  let {
    src,
    alt,
    placeholder,
    kind,
    loading = 'lazy',
    className = '',
    style = '',
  }: {
    src: string;
    alt: string;
    placeholder: string;
    kind: 'avatar' | 'pet';
    loading?: 'eager' | 'lazy';
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
    <img {src} {alt} {loading} onerror={() => (failed = true)} />
  {:else}
    <span class="asset-placeholder" aria-hidden="true">{placeholder}</span>
  {/if}
</span>
<style>
  .asset-portrait { position: relative; display: grid; place-items: center; width: 100%; height: 100%; overflow: hidden; }
  img { display: block; width: 100%; height: 100%; object-fit: contain; object-position: 50% 100%; }
  .asset-placeholder { font-size: 34px; line-height: 1; }
</style>
