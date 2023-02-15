.PHONY: build test

build: sky.js orb.js

%.js: %.ts
	deno bundle --no-check $^ -- $@

test:
	deno test --no-check
