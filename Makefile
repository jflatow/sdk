.PHONY: build test

build: sky.js orb.js

%.js: %.ts
	deno bundle $^ -- $@

test:
	deno test
