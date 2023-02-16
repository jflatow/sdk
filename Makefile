.PHONY: build test examples

build: sdk.js sky.js orb.js

%.js: %.ts
	deno bundle $^ -- $@

test:
	deno test

examples: PORT = 8011
examples: build
	open 'http://localhost:$(PORT)/examples/'
	deno run --allow-net --allow-read https://deno.land/std/http/file_server.ts -p $(PORT)
