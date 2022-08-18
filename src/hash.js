addEventListener("fetch", (event) => {
  event.respondWith(
    handleRequest(event.request).catch(
      (err) => new Response(err.stack, { status: 500 })
    )
  );
});

async function digestMessage(message, algo) {
  const msgUint8 = new TextEncoder().encode(message); // encode as (utf-8)
  const hashBuffer = await crypto.subtle.digest(algo, msgUint8); // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer)); // buffer to byte array
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // bytes to hex string
  return hashHex;
}

async function multiHash(input, algo, times) {
  for (let i = 0; i < times; i++) {
    input = await digestMessage(input, algo);
  }
  return input;
}

async function handleRequest(request) {
  const { searchParams } = new URL(request.url);
  const input = searchParams.get('input');
  const times = searchParams.get('times') ?? 5000;
  const algo = searchParams.get('algo') ?? "SHA-256";
  if (!input) return new Response("Missing input parameter", { status: 400 });
  return new Response(await multiHash(input, algo, times));
}