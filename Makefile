.PHONY: build test \
	examples examples-open examples-serve

build: sdk.js sky.js sun.js orb.js

%.js: %.ts
	deno run -A https://deno.land/x/bundy/cli.ts $^ > $@

test:
	deno test --quiet

examples: examples-open examples-serve

examples-open: PORT = 8011
examples-open:
	open 'http://localhost:$(PORT)/examples/'

examples-serve: PORT = 8011
examples-serve: build
	deno run -A https://deno.land/std/http/file_server.ts -p $(PORT)
