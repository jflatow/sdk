.PHONY: build test \
	examples examples-open examples-serve

build: sdk.js sky.js sun.js orb.js

%.js: %.ts
	deno bundle $^ -- $@

test:
	deno test --quiet

examples: examples-open examples-serve

examples-open:
	open 'http://localhost:$(PORT)/examples/'

examples-serve: PORT = 8011
examples-serve: build
	deno run --allow-net --allow-read https://deno.land/std/http/file_server.ts -p $(PORT)
