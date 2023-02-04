.PHONY: build

build: sky.js orb.js

%.js: %.ts
	deno bundle --no-check $^ -- $@
